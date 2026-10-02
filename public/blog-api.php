<?php
ob_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit;
}

$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require $config_path;

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'DB Connection failed']);
    exit;
}

$table = 'ssc_blog_posts';
$conn->query("CREATE TABLE IF NOT EXISTS `$table` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT NULL,
    body LONGTEXT NULL,
    image_url VARCHAR(500) NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'published',
    UNIQUE KEY slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$action = $_GET['action'] ?? '';

if ($action === 'list') {
    $res = $conn->query("SELECT * FROM `$table` WHERE status = 'published' ORDER BY published_at DESC");
    $posts = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $posts[] = $row;
        }
    }
    ob_end_clean();
    echo json_encode(['ok' => true, 'posts' => $posts]);
    exit;
}

if ($action === 'get') {
    $slug = $conn->real_escape_string($_GET['slug'] ?? '');
    $res = $conn->query("SELECT * FROM `$table` WHERE slug = '$slug' LIMIT 1");
    if ($res && $res->num_rows > 0) {
        ob_end_clean();
        echo json_encode(['ok' => true, 'post' => $res->fetch_assoc()]);
    } else {
        ob_end_clean();
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Not found']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $title = $conn->real_escape_string($data['title'] ?? '');
    $slug = $conn->real_escape_string($data['slug'] ?? '');
    $excerpt = $conn->real_escape_string($data['excerpt'] ?? '');
    $body = $conn->real_escape_string($data['body'] ?? '');
    $image_url = $conn->real_escape_string($data['image_url'] ?? '');
    
    if (!$title || !$slug) {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => 'Title and slug required']);
        exit;
    }
    
    $sql = "INSERT INTO `$table` (title, slug, excerpt, body, image_url) VALUES ('$title', '$slug', '$excerpt', '$body', '$image_url')";
    if ($conn->query($sql)) {
        ob_end_clean();
        echo json_encode(['ok' => true, 'id' => $conn->insert_id]);
    } else {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => $conn->error]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);
    $conn->query("DELETE FROM `$table` WHERE id = $id");
    ob_end_clean();
    echo json_encode(['ok' => true]);
    exit;
}

ob_end_clean();
echo json_encode(['ok' => false, 'error' => 'Invalid action']);
