<?php
/**
 * SSC 2026 WhatsApp Groups API
 * Endpoint for reading/managing attendee WhatsApp group configuration and stats.
 */

ob_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { ob_end_clean(); exit; }

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
    echo json_encode(['ok' => false, 'error' => 'DB connection failed']);
    exit;
}
$conn->set_charset('utf8mb4');

$groups_table = 'ssc_whatsapp_groups';
$reg_table    = 'ssc_2026_registrations';

// Ensure groups table exists
$conn->query("CREATE TABLE IF NOT EXISTS `$groups_table` (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    capacity   INT NOT NULL DEFAULT 1000,
    assigned   INT NOT NULL DEFAULT 0,
    link       VARCHAR(500) NOT NULL DEFAULT '',
    active     TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Seed defaults if empty
$count_res = $conn->query("SELECT COUNT(*) AS cnt FROM `$groups_table`");
if ($count_res && $count_res->fetch_assoc()['cnt'] == 0) {
    $defaults = [
        [1, 'SSC 2026 Attendees 01', 1000, 'https://chat.whatsapp.com/HuuOUNSbSnyG6Fbz32DeYJ'],
        [2, 'SSC 2026 Attendees 02', 1000, 'https://chat.whatsapp.com/Ca7ZveBe2JX4QOXk4i1wHx'],
        [3, 'SSC 2026 Attendees 03', 1000, 'https://chat.whatsapp.com/DM6bKrrnqXgGR8QFsmOhUF'],
        [4, 'SSC 2026 Attendees 04', 1000, 'https://chat.whatsapp.com/C6CPDyEmLKC70YRuRjsxzM'],
        [5, 'SSC 2026 Attendees 05', 1000, 'https://chat.whatsapp.com/Jt1bUMle06xHLnNrDljKeX'],
    ];
    $ins = $conn->prepare("INSERT INTO `$groups_table` (sort_order, name, capacity, link) VALUES (?,?,?,?)");
    foreach ($defaults as $d) {
        $ins->bind_param('isis', $d[0], $d[1], $d[2], $d[3]);
        $ins->execute();
    }
    $ins->close();
}

// Recalculate 'assigned' from actual registrations (keeps it accurate)
$conn->query("UPDATE `$groups_table` g
    SET g.assigned = (
        SELECT COUNT(*) FROM `$reg_table` r WHERE r.whatsapp_group_id = g.id
    )");

$action = $_GET['action'] ?? '';

// ── GET /list — public stats (no links exposed) ───────────────────────────────
if ($action === 'list') {
    $res = $conn->query("SELECT id, name, capacity, assigned, active, sort_order FROM `$groups_table` ORDER BY sort_order ASC, id ASC");
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $r['remaining'] = max(0, (int)$r['capacity'] - (int)$r['assigned']);
        $r['status']    = ((int)$r['assigned'] >= (int)$r['capacity']) ? 'Full' : 'Open';
        $rows[] = $r;
    }
    ob_end_clean();
    echo json_encode(['ok' => true, 'groups' => $rows]);
    exit;
}

// ── GET /admin-list — includes links (admin only via POST token later) ─────────
if ($action === 'admin-list') {
    $res = $conn->query("SELECT * FROM `$groups_table` ORDER BY sort_order ASC, id ASC");
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $r['remaining'] = max(0, (int)$r['capacity'] - (int)$r['assigned']);
        $r['status']    = ((int)$r['assigned'] >= (int)$r['capacity']) ? 'Full' : 'Open';
        $rows[] = $r;
    }
    ob_end_clean();
    echo json_encode(['ok' => true, 'groups' => $rows]);
    exit;
}

// ── POST /create — add a new group ───────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $data     = json_decode(file_get_contents('php://input'), true) ?: [];
    $name     = trim($data['name'] ?? '');
    $capacity = (int)($data['capacity'] ?? 1000);
    $link     = trim($data['link'] ?? '');
    $order    = (int)($data['sort_order'] ?? 99);

    if (!$name || !$link) {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => 'name and link are required']);
        exit;
    }
    $stmt = $conn->prepare("INSERT INTO `$groups_table` (name, capacity, link, sort_order) VALUES (?,?,?,?)");
    $stmt->bind_param('sisi', $name, $capacity, $link, $order);
    if ($stmt->execute()) {
        ob_end_clean();
        echo json_encode(['ok' => true, 'id' => $stmt->insert_id]);
    } else {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => $conn->error]);
    }
    $stmt->close();
    exit;
}

// ── PUT /update — edit a group ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'update') {
    $id   = (int)($_GET['id'] ?? 0);
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    if (!$id) { ob_end_clean(); echo json_encode(['ok' => false, 'error' => 'id required']); exit; }

    $sets = [];
    $types = '';
    $vals = [];

    if (isset($data['name']))       { $sets[] = 'name = ?';       $types .= 's'; $vals[] = $data['name']; }
    if (isset($data['capacity']))   { $sets[] = 'capacity = ?';   $types .= 'i'; $vals[] = (int)$data['capacity']; }
    if (isset($data['link']))       { $sets[] = 'link = ?';       $types .= 's'; $vals[] = $data['link']; }
    if (isset($data['active']))     { $sets[] = 'active = ?';     $types .= 'i'; $vals[] = (int)$data['active']; }
    if (isset($data['sort_order'])) { $sets[] = 'sort_order = ?'; $types .= 'i'; $vals[] = (int)$data['sort_order']; }

    if (empty($sets)) { ob_end_clean(); echo json_encode(['ok' => false, 'error' => 'nothing to update']); exit; }

    $types .= 'i';
    $vals[] = $id;
    $sql = "UPDATE `$groups_table` SET " . implode(', ', $sets) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$vals);
    $stmt->execute();
    ob_end_clean();
    echo json_encode(['ok' => true]);
    $stmt->close();
    exit;
}

// ── DELETE /delete ────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { ob_end_clean(); echo json_encode(['ok' => false, 'error' => 'id required']); exit; }

    // Safety: don't delete a group that has registrations
    $chk = $conn->query("SELECT COUNT(*) AS c FROM `$reg_table` WHERE whatsapp_group_id = $id");
    $cnt = $chk->fetch_assoc()['c'];
    if ($cnt > 0) {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => "Cannot delete: $cnt registrations are assigned to this group. Deactivate it instead."]);
        exit;
    }
    $conn->query("DELETE FROM `$groups_table` WHERE id = $id");
    ob_end_clean();
    echo json_encode(['ok' => true]);
    exit;
}

// ── GET /attendees — list registrations for a group ──────────────────────────
if ($action === 'attendees') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { ob_end_clean(); echo json_encode(['ok' => false, 'error' => 'id required']); exit; }

    $res = $conn->query("SELECT id, full_name, email, phone, created_at, status
        FROM `$reg_table` WHERE whatsapp_group_id = $id ORDER BY created_at ASC");
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    ob_end_clean();
    echo json_encode(['ok' => true, 'attendees' => $rows, 'count' => count($rows)]);
    exit;
}

ob_end_clean();
echo json_encode(['ok' => false, 'error' => 'Unknown action']);
