<?php
/**
 * Mobilizer API Endpoint
 *
 * Provides personal referral statistics and referred attendees for an authenticated mobilizer.
 * Enforces strict token-based authorization to prevent IDOR / unauthorized data access.
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
require_once $config_path;

// Extract token from query or Authorization header
$token = trim($_GET['token'] ?? '');
if (empty($token) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    if (preg_match('/Bearer\s+(\S+)/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
        $token = trim($matches[1]);
    }
}

if (empty($token)) {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Missing access token. Please access your dashboard using your personalized link.']);
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
$mob_table = $table_prefix . 'ssc2026_mobilizers';
$reg_table = $table_prefix . 'ssc2026_registrations';

// Verify token
$stmt = $conn->prepare("SELECT id, full_name, email, organization, referral_code, created_at, status FROM `$mob_table` WHERE auth_token = ? LIMIT 1");
$stmt->bind_param('s', $token);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    $stmt->close();
    $conn->close();
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Invalid or expired access token.']);
    exit;
}

$mobilizer = $res->fetch_assoc();
$stmt->close();

$ref_code = $mobilizer['referral_code'];

// Build referral URL
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$http_proto = $is_https ? 'https://' : 'https://';
$host = $_SERVER['HTTP_HOST'] ?? 'thetakeovernetwork.org';
$referral_link = $http_proto . $host . '/conference-register?ref=' . $ref_code;

// Fetch attributed attendees
$att_stmt = $conn->prepare("
    SELECT id, full_name, email, school_org, status, created_at, checked_in_at
    FROM `$reg_table`
    WHERE referred_by_code = ? AND status != 'Cancelled'
    ORDER BY created_at DESC
");
$att_stmt->bind_param('s', $ref_code);
$att_stmt->execute();
$att_res = $att_stmt->get_result();

$attendees = [];
$total_checked_in = 0;

function mask_email($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return '***';
    $parts = explode('@', $email);
    $name = $parts[0];
    $domain = $parts[1] ?? '';
    $masked_name = strlen($name) <= 2 ? substr($name, 0, 1) . '***' : substr($name, 0, 1) . str_repeat('*', min(4, strlen($name) - 2)) . substr($name, -1);
    return $masked_name . '@' . $domain;
}

while ($row = $att_res->fetch_assoc()) {
    $is_checked_in = ($row['status'] === 'Checked In' || !empty($row['checked_in_at']));
    if ($is_checked_in) {
        $total_checked_in++;
    }
    
    $attendees[] = [
        'id'               => $row['id'],
        'name'             => $row['full_name'],
        'masked_email'     => mask_email($row['email']),
        'institution'      => $row['school_org'] ?: 'N/A',
        'registration_date'=> substr($row['created_at'], 0, 10),
        'status'           => $is_checked_in ? 'Checked In' : 'Pending',
        'checked_in_at'    => $row['checked_in_at'] ? substr($row['checked_in_at'], 0, 16) : null,
    ];
}
$att_stmt->close();
$conn->close();

$total_registered = count($attendees);
$attendance_rate = $total_registered > 0 ? round(($total_checked_in / $total_registered) * 100, 1) : 0;

ob_end_clean();
echo json_encode([
    'ok' => true,
    'mobilizer' => [
        'name'          => $mobilizer['full_name'],
        'organization'  => $mobilizer['organization'],
        'referral_code' => $mobilizer['referral_code'],
        'referral_link' => $referral_link,
        'created_at'    => substr($mobilizer['created_at'], 0, 10),
    ],
    'stats' => [
        'total_registered' => $total_registered,
        'total_checked_in' => $total_checked_in,
        'attendance_rate'  => $attendance_rate,
    ],
    'attendees' => $attendees,
]);
