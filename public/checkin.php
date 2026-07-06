<?php
/**
 * Event Check-in Endpoint
 * Scans QR data (Registration ID) and marks attendance.
 */
ini_set('display_errors', 0);
error_reporting(0);
ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Config missing']);
    exit;
}
require_once $config_path;

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$reg_id = trim($data['qr_data'] ?? '');

if (empty($reg_id)) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'No QR data provided']);
    exit;
}

// Ensure it looks like an SSC ID (SSC26-XXXXXXXX)
if (!preg_match('/^SSC26-[A-Z0-9]+$/', $reg_id)) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'Invalid QR Code format']);
    exit;
}

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', DB_USER, DB_PASSWORD, DB_NAME);
}
if ($conn->connect_errno) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'DB error']);
    exit;
}
$conn->set_charset('utf8mb4');

$table = TABLE_PREFIX . 'ssc2026_registrations';
$stmt = $conn->prepare("SELECT id, full_name, email, status FROM `$table` WHERE id = ?");
$stmt->bind_param('s', $reg_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'Registration not found']);
    exit;
}

$row = $result->fetch_assoc();

if ($row['status'] === 'Checked In') {
    ob_end_clean();
    echo json_encode(['ok' => true, 'already_checked_in' => true, 'name' => $row['full_name'], 'email' => $row['email']]);
    exit;
}

$update = $conn->prepare("UPDATE `$table` SET status = 'Checked In' WHERE id = ?");
$update->bind_param('s', $reg_id);
$update->execute();

ob_end_clean();
echo json_encode(['ok' => true, 'already_checked_in' => false, 'name' => $row['full_name'], 'email' => $row['email']]);
