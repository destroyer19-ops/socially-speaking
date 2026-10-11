<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed. Received: ' . $_SERVER['REQUEST_METHOD']]);
    exit;
}

$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require_once $config_path;

$db_host   = defined('DB_HOST')      ? DB_HOST      : 'localhost';
$db_user   = defined('DB_USER')      ? DB_USER      : 'root';
$db_pass   = defined('DB_PASSWORD')  ? DB_PASSWORD  : '';
$db_name   = defined('DB_NAME')      ? DB_NAME      : '';
$prefix    = defined('TABLE_PREFIX') ? TABLE_PREFIX : 'wp_';

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', $db_user, $db_pass, $db_name);
}

if ($conn->connect_errno) {
    echo json_encode(['ok' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$table_name = $prefix . 'ssc2026_volunteers';

// Optional: specific ID approval or all pending
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : null;

if ($id) {
    $stmt = $conn->prepare("UPDATE `$table_name` SET status = 'Approved' WHERE id = ?");
    $stmt->bind_param("i", $id);
    $success = $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
} else {
    // Approve all pending
    $success = $conn->query("UPDATE `$table_name` SET status = 'Approved' WHERE status = 'Pending'");
    $affected = $conn->affected_rows;
}

if ($success) {
    echo json_encode(['ok' => true, 'affected' => $affected]);
} else {
    echo json_encode(['ok' => false, 'error' => 'Failed to approve volunteers: ' . $conn->error]);
}

$conn->close();
