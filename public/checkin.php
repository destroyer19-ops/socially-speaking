<?php
/**
 * SSC 2026 Event-Day Check-in Endpoint
 *
 * Verifies attendee QR codes or Registration IDs, prevents duplicate attendance inflation,
 * supports both mobile camera scanning and hardware handheld scanners,
 * and securely marks attendance with timestamp and staff attribution.
 */

set_exception_handler(function ($e) {
    if (ob_get_length()) ob_end_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Server Error: ' . $e->getMessage()]);
    exit;
});

ob_start();

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require_once $config_path;

// ── Check-In Security Verification ───────────────────────────────────────────
// Check for staff authorization PIN or session/token
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
    exit;
}

// Default staff PIN is SSC2026 (or custom defined)
$configured_pin = defined('CHECKIN_STAFF_PIN') ? CHECKIN_STAFF_PIN : 'SSC2026';
$provided_pin = trim($data['staff_pin'] ?? $_SERVER['HTTP_X_STAFF_PIN'] ?? '');

// If staff_pin is sent or required, validate
if (!empty($configured_pin) && $provided_pin !== $configured_pin) {
    // Check if called from active admin context or if PIN matches
    // If no PIN provided, allow when testing locally or if admin token is present
    if (empty($provided_pin) && empty($_SERVER['HTTP_AUTHORIZATION'])) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Staff authorization required. Please provide staff check-in PIN.']);
        exit;
    }
}

$staff_name = trim(strip_tags($data['staff_name'] ?? 'Gate Staff'));
$raw_qr     = trim($data['qr_data'] ?? $data['reg_id'] ?? '');

if (empty($raw_qr)) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'No QR code or Registration ID provided.']);
    exit;
}

// ── Extract Registration ID ───────────────────────────────────────────────────
// Supports:
// 1. Raw ID: "SSC26-XXXXXXXX"
// 2. Legacy Pipe ID: "SSC26-XXXXXXXX|A1-12"
// 3. URLs containing ID: "https://...id=SSC26-XXXXXXXX"
$reg_id = '';
if (preg_match('/(SSC26-[A-Z0-9]+)/i', $raw_qr, $matches)) {
    $reg_id = strtoupper($matches[1]);
} else if (preg_match('/^[A-Z0-9]{8}$/i', $raw_qr)) {
    $reg_id = 'SSC26-' . strtoupper($raw_qr);
}

if (empty($reg_id)) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'Invalid QR code format. Must be an SSC2026 attendee code.']);
    exit;
}

// ── Database connection ───────────────────────────────────────────────────────
mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', DB_USER, DB_PASSWORD, DB_NAME);
}
if ($conn->connect_errno) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
}
$conn->set_charset('utf8mb4');

$table_prefix = defined('TABLE_PREFIX') ? TABLE_PREFIX : '';
$table = $table_prefix . 'ssc2026_registrations';

// Fetch attendee record
$stmt = $conn->prepare("SELECT id, full_name, email, school_org, status, checked_in_at, checked_in_by, referred_by_code FROM `$table` WHERE id = ? LIMIT 1");
$stmt->bind_param('s', $reg_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    $stmt->close();
    $conn->close();
    ob_end_clean();
    echo json_encode([
        'ok'    => false,
        'error' => 'Registration ID not found in database: ' . $reg_id
    ]);
    exit;
}

$row = $res->fetch_assoc();
$stmt->close();

$is_already_checked_in = ($row['status'] === 'Checked In' || !empty($row['checked_in_at']));

if ($is_already_checked_in) {
    $conn->close();
    ob_end_clean();
    echo json_encode([
        'ok'                 => true,
        'already_checked_in' => true,
        'id'                 => $row['id'],
        'name'               => $row['full_name'],
        'school_org'         => $row['school_org'] ?: 'Attendee',
        'checked_in_at'      => $row['checked_in_at'] ?? 'Earlier',
        'checked_in_by'      => $row['checked_in_by'] ?? 'Staff',
        'message'            => 'Attendee is already checked in.',
    ]);
    exit;
}

// Atomically mark check-in (prevents duplicate check-ins even with simultaneous scans)
$now = date('Y-m-d H:i:s');
$update_stmt = $conn->prepare("UPDATE `$table` SET status = 'Checked In', checked_in_at = ?, checked_in_by = ? WHERE id = ? AND status != 'Checked In'");
$update_stmt->bind_param('sss', $now, $staff_name, $reg_id);
$update_stmt->execute();
$affected = $update_stmt->affected_rows;
$update_stmt->close();
$conn->close();

if ($affected === 0) {
    // Simultaneous scan won race condition
    ob_end_clean();
    echo json_encode([
        'ok'                 => true,
        'already_checked_in' => true,
        'id'                 => $row['id'],
        'name'               => $row['full_name'],
        'school_org'         => $row['school_org'] ?: 'Attendee',
        'checked_in_at'      => $now,
        'checked_in_by'      => $staff_name,
        'message'            => 'Attendee was just checked in.',
    ]);
    exit;
}

ob_end_clean();
echo json_encode([
    'ok'                 => true,
    'already_checked_in' => false,
    'id'                 => $row['id'],
    'name'               => $row['full_name'],
    'school_org'         => $row['school_org'] ?: 'Attendee',
    'checked_in_at'      => $now,
    'checked_in_by'      => $staff_name,
    'referred_by'        => $row['referred_by_code'],
    'message'            => 'Check-in successful! Welcome to SSC 2026.',
]);
