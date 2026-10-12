<?php
ob_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Pin');
header('Cache-Control: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit;
}

$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require $config_path;

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', DB_USER, DB_PASSWORD, DB_NAME);
}
if ($conn->connect_errno) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'DB Connection failed: ' . $conn->connect_error]);
    exit;
}

$conn->set_charset('utf8mb4');
$table = 'ssc_blog_posts';

// ── Ensure table exists ───────────────────────────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS `$table` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT NULL,
    body LONGTEXT NULL,
    image_url VARCHAR(500) NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Socially Speaking',
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    tags VARCHAR(255) NULL,
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'published',
    UNIQUE KEY uniq_blog_slug (slug),
    INDEX idx_blog_status (status),
    INDEX idx_blog_category (category),
    INDEX idx_blog_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// ── Idempotently add missing columns ──────────────────────────────────────────
$needed_cols = [
    'author'          => "ALTER TABLE `$table` ADD COLUMN `author` VARCHAR(100) NOT NULL DEFAULT 'Socially Speaking' AFTER `image_url`",
    'category'        => "ALTER TABLE `$table` ADD COLUMN `category` VARCHAR(100) NOT NULL DEFAULT 'General' AFTER `author`",
    'tags'            => "ALTER TABLE `$table` ADD COLUMN `tags` VARCHAR(255) NULL AFTER `category`",
    'seo_title'       => "ALTER TABLE `$table` ADD COLUMN `seo_title` VARCHAR(255) NULL AFTER `tags`",
    'seo_description' => "ALTER TABLE `$table` ADD COLUMN `seo_description` TEXT NULL AFTER `seo_title`",
    'updated_at'      => "ALTER TABLE `$table` ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `published_at`",
];

foreach ($needed_cols as $col => $sql) {
    $chk = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$col'");
    if ($chk && $chk->num_rows === 0) {
        $conn->query($sql);
    }
}

$action = $_GET['action'] ?? '';

// ── 1. PUBLIC LIST (Published articles only) ──────────────────────────────────
if ($action === 'list') {
    $category = trim($_GET['category'] ?? '');
    if (!empty($category)) {
        $stmt = $conn->prepare("SELECT id, title, slug, excerpt, image_url, author, category, tags, published_at, status FROM `$table` WHERE status = 'published' AND category = ? ORDER BY published_at DESC");
        $stmt->bind_param('s', $category);
    } else {
        $stmt = $conn->prepare("SELECT id, title, slug, excerpt, image_url, author, category, tags, published_at, status FROM `$table` WHERE status = 'published' ORDER BY published_at DESC");
    }
    
    $stmt->execute();
    $res = $stmt->get_result();
    $posts = [];
    while ($row = $res->fetch_assoc()) {
        $posts[] = $row;
    }
    $stmt->close();
    $conn->close();

    ob_end_clean();
    echo json_encode(['ok' => true, 'posts' => $posts]);
    exit;
}

// ── 2. ADMIN LIST (All articles: published and drafts) ────────────────────────
if ($action === 'admin_list') {
    $stmt = $conn->prepare("SELECT id, title, slug, excerpt, image_url, author, category, tags, published_at, updated_at, status FROM `$table` ORDER BY COALESCE(updated_at, published_at) DESC");
    $stmt->execute();
    $res = $stmt->get_result();
    $posts = [];
    $published_cnt = 0;
    $draft_cnt = 0;

    while ($row = $res->fetch_assoc()) {
        $posts[] = $row;
        if ($row['status'] === 'published') {
            $published_cnt++;
        } else {
            $draft_cnt++;
        }
    }
    $stmt->close();
    $conn->close();

    ob_end_clean();
    echo json_encode([
        'ok'     => true,
        'posts'  => $posts,
        'counts' => [
            'total'     => count($posts),
            'published' => $published_cnt,
            'draft'     => $draft_cnt,
        ]
    ]);
    exit;
}

// ── 3. GET SINGLE POST (by slug or id) ─────────────────────────────────────────
if ($action === 'get') {
    $slug    = trim($_GET['slug'] ?? '');
    $id      = (int)($_GET['id'] ?? 0);
    $preview = !empty($_GET['preview']);

    if ($id > 0) {
        $stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ? LIMIT 1");
        $stmt->bind_param('i', $id);
    } elseif (!empty($slug)) {
        if ($preview) {
            $stmt = $conn->prepare("SELECT * FROM `$table` WHERE slug = ? LIMIT 1");
            $stmt->bind_param('s', $slug);
        } else {
            $stmt = $conn->prepare("SELECT * FROM `$table` WHERE slug = ? AND status = 'published' LIMIT 1");
            $stmt->bind_param('s', $slug);
        }
    } else {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Slug or ID required']);
        exit;
    }

    $stmt->execute();
    $res = $stmt->get_result();
    if ($res && $res->num_rows > 0) {
        $post = $res->fetch_assoc();
        $stmt->close();
        $conn->close();
        ob_end_clean();
        echo json_encode(['ok' => true, 'post' => $post]);
    } else {
        $stmt->close();
        $conn->close();
        ob_end_clean();
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Post not found']);
    }
    exit;
}

// ── 4. CREATE ARTICLE ─────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $title           = trim($data['title'] ?? '');
    $slug            = trim($data['slug'] ?? '');
    $excerpt         = trim($data['excerpt'] ?? '');
    $body            = trim($data['body'] ?? '');
    $image_url       = trim($data['image_url'] ?? '');
    $author          = trim($data['author'] ?? 'Socially Speaking');
    $category        = trim($data['category'] ?? 'General');
    $tags            = trim($data['tags'] ?? '');
    $seo_title       = trim($data['seo_title'] ?? '');
    $seo_description = trim($data['seo_description'] ?? '');
    $status          = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'published';

    if (empty($title)) {
        ob_end_clean();
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'Article title is required']);
        exit;
    }

    // Auto-generate slug if empty
    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    } else {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $slug), '-'));
    }
    if (empty($slug)) {
        $slug = 'article-' . time();
    }

    // Check slug uniqueness; append number if collision
    $base_slug = $slug;
    $counter = 1;
    while (true) {
        $chk = $conn->prepare("SELECT id FROM `$table` WHERE slug = ? LIMIT 1");
        $chk->bind_param('s', $slug);
        $chk->execute();
        $chk->store_result();
        if ($chk->num_rows === 0) {
            $chk->close();
            break;
        }
        $chk->close();
        $counter++;
        $slug = $base_slug . '-' . $counter;
    }

    $stmt = $conn->prepare("INSERT INTO `$table`
        (title, slug, excerpt, body, image_url, author, category, tags, seo_title, seo_description, status, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

    if (!$stmt) {
        $err = $conn->error;
        $conn->close();
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Prepare failed: ' . $err]);
        exit;
    }

    $stmt->bind_param(
        'sssssssssss',
        $title,
        $slug,
        $excerpt,
        $body,
        $image_url,
        $author,
        $category,
        $tags,
        $seo_title,
        $seo_description,
        $status
    );

    if ($stmt->execute()) {
        $new_id = $conn->insert_id;
        $stmt->close();
        $conn->close();
        ob_end_clean();
        echo json_encode([
            'ok'      => true,
            'id'      => $new_id,
            'slug'    => $slug,
            'status'  => $status,
            'message' => 'Article saved successfully'
        ]);
    } else {
        $err = $stmt->error;
        $stmt->close();
        $conn->close();
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to save article: ' . $err]);
    }
    exit;
}

// ── 5. UPDATE ARTICLE ─────────────────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') && $action === 'update') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data) || empty($data['id'])) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Article ID is required']);
        exit;
    }

    $id              = (int)$data['id'];
    $title           = trim($data['title'] ?? '');
    $slug            = trim($data['slug'] ?? '');
    $excerpt         = trim($data['excerpt'] ?? '');
    $body            = trim($data['body'] ?? '');
    $image_url       = trim($data['image_url'] ?? '');
    $author          = trim($data['author'] ?? 'Socially Speaking');
    $category        = trim($data['category'] ?? 'General');
    $tags            = trim($data['tags'] ?? '');
    $seo_title       = trim($data['seo_title'] ?? '');
    $seo_description = trim($data['seo_description'] ?? '');
    $status          = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'published';

    if (empty($title)) {
        ob_end_clean();
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'Article title is required']);
        exit;
    }

    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    } else {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $slug), '-'));
    }

    // Check slug collision against OTHER articles
    $chk = $conn->prepare("SELECT id FROM `$table` WHERE slug = ? AND id != ? LIMIT 1");
    $chk->bind_param('si', $slug, $id);
    $chk->execute();
    $chk->store_result();
    if ($chk->num_rows > 0) {
        $slug = $slug . '-' . time();
    }
    $chk->close();

    $stmt = $conn->prepare("UPDATE `$table` SET
        title = ?,
        slug = ?,
        excerpt = ?,
        body = ?,
        image_url = ?,
        author = ?,
        category = ?,
        tags = ?,
        seo_title = ?,
        seo_description = ?,
        status = ?,
        updated_at = NOW()
        WHERE id = ?");

    if (!$stmt) {
        $err = $conn->error;
        $conn->close();
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Prepare failed: ' . $err]);
        exit;
    }

    $stmt->bind_param(
        'sssssssssssi',
        $title,
        $slug,
        $excerpt,
        $body,
        $image_url,
        $author,
        $category,
        $tags,
        $seo_title,
        $seo_description,
        $status,
        $id
    );

    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        ob_end_clean();
        echo json_encode([
            'ok'      => true,
            'id'      => $id,
            'slug'    => $slug,
            'status'  => $status,
            'message' => 'Article updated successfully'
        ]);
    } else {
        $err = $stmt->error;
        $stmt->close();
        $conn->close();
        ob_end_clean();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to update article: ' . $err]);
    }
    exit;
}

// ── 6. TOGGLE STATUS (draft <-> published) ───────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'toggle_status') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    $new_status = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : null;

    if ($id <= 0) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Valid ID required']);
        exit;
    }

    if ($new_status === null) {
        // Fetch current and toggle
        $chk = $conn->query("SELECT status FROM `$table` WHERE id = $id LIMIT 1");
        if ($chk && $chk->num_rows > 0) {
            $curr = $chk->fetch_assoc()['status'];
            $new_status = ($curr === 'published') ? 'draft' : 'published';
        } else {
            $new_status = 'published';
        }
    }

    $stmt = $conn->prepare("UPDATE `$table` SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param('si', $new_status, $id);
    $ok = $stmt->execute();
    $stmt->close();
    $conn->close();

    ob_end_clean();
    echo json_encode(['ok' => $ok, 'status' => $new_status]);
    exit;
}

// ── 7. DELETE ARTICLE ─────────────────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') && $action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int)($data['id'] ?? 0);
    }

    if ($id <= 0) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Valid ID required']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM `$table` WHERE id = ?");
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    $stmt->close();
    $conn->close();

    ob_end_clean();
    echo json_encode(['ok' => $ok]);
    exit;
}

ob_end_clean();
echo json_encode(['ok' => false, 'error' => 'Invalid action']);
