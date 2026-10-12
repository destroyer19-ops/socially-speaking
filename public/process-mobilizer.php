<?php
/**
 * SSC 2026 Dedicated Mobilizer Registration & Recovery Endpoint
 *
 * Registers mobilizers, generates unique referral codes, issues dashboard auth tokens,
 * handles duplicate emails safely with recovery/resend, and sends confirmation emails via Brevo.
 */

// Error handling to prevent non-JSON 500 outputs
set_exception_handler(function ($e) {
    if (ob_get_length()) ob_end_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'error' => 'Server Error: ' . $e->getMessage()
    ]);
    exit;
});

ob_start();

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

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
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require_once $config_path;

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
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

// Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS `$mob_table` (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    created_at     DATETIME      NOT NULL,
    full_name      VARCHAR(200)  NOT NULL,
    email          VARCHAR(200)  NOT NULL,
    phone          VARCHAR(50)   NOT NULL,
    organization   VARCHAR(200)  NOT NULL,
    referral_code  VARCHAR(32)   NOT NULL,
    auth_token     VARCHAR(64)   NOT NULL,
    status         VARCHAR(50)   NOT NULL DEFAULT 'active',
    UNIQUE KEY uniq_mobilizer_email (email),
    UNIQUE KEY uniq_mobilizer_ref_code (referral_code),
    UNIQUE KEY uniq_mobilizer_token (auth_token),
    INDEX idx_mobilizer_org (organization),
    INDEX idx_mobilizer_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Domain determination
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$http_proto = $is_https ? 'https://' : 'https://';
$host = $_SERVER['HTTP_HOST'] ?? 'thetakeovernetwork.org';
$base_domain = $http_proto . $host;

$action = trim($data['action'] ?? 'register');
$email  = trim(strip_tags($data['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please provide a valid email address.']);
    exit;
}

// ── RECOVERY ACTION ───────────────────────────────────────────────────────────
if ($action === 'recover') {
    $escaped_email = $conn->real_escape_string($email);
    $stmt = $conn->prepare("SELECT id, full_name, organization, referral_code, auth_token FROM `$mob_table` WHERE email = ? LIMIT 1");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($res->num_rows === 0) {
        $stmt->close();
        $conn->close();
        ob_end_clean();
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'No mobilizer account found for this email address. Please register as a mobilizer first.']);
        exit;
    }
    
    $mob = $res->fetch_assoc();
    $stmt->close();
    
    $referral_url = $base_domain . '/conference-register?ref=' . $mob['referral_code'];
    $dashboard_url = $base_domain . '/mobilizer-dashboard?token=' . $mob['auth_token'];
    
    // Send recovery email via Brevo
    send_mobilizer_email(
        $email,
        $mob['full_name'],
        $mob['organization'],
        $mob['referral_code'],
        $referral_url,
        $dashboard_url,
        true // is recovery
    );
    
    $conn->close();
    ob_end_clean();
    echo json_encode([
        'ok'            => true,
        'message'       => 'Your mobilizer link and dashboard details have been sent to your email.',
        'referral_code' => $mob['referral_code'],
        'referral_link' => $referral_url,
        'token'         => $mob['auth_token'],
    ]);
    exit;
}

// ── REGISTRATION ACTION ───────────────────────────────────────────────────────
$full_name    = trim(strip_tags($data['full_name'] ?? ''));
$phone        = trim(strip_tags($data['phone'] ?? ''));
$organization = trim(strip_tags($data['organization'] ?? ''));

if (empty($full_name) || empty($phone) || empty($organization)) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Full name, email, phone number, and institution/organization are all required.']);
    exit;
}

// Duplicate email check
$escaped_email = $conn->real_escape_string($email);
$check = $conn->query("SELECT id, full_name, organization, referral_code, auth_token FROM `$mob_table` WHERE email = '$escaped_email' LIMIT 1");

if ($check && $check->num_rows > 0) {
    $existing = $check->fetch_assoc();
    $referral_url = $base_domain . '/conference-register?ref=' . $existing['referral_code'];
    $dashboard_url = $base_domain . '/mobilizer-dashboard?token=' . $existing['auth_token'];
    
    // Resend confirmation email safely
    send_mobilizer_email(
        $email,
        $existing['full_name'],
        $existing['organization'],
        $existing['referral_code'],
        $referral_url,
        $dashboard_url,
        false
    );
    
    $conn->close();
    ob_end_clean();
    echo json_encode([
        'ok'            => true,
        'is_existing'   => true,
        'message'       => 'Welcome back! You are already registered as a mobilizer.',
        'full_name'     => $existing['full_name'],
        'organization'  => $existing['organization'],
        'referral_code' => $existing['referral_code'],
        'referral_link' => $referral_url,
        'token'         => $existing['auth_token'],
    ]);
    exit;
}

// Generate unique referral code
$ref_code = null;
for ($i = 0; $i < 10; $i++) {
    $candidate = 'MOB' . strtoupper(bin2hex(random_bytes(3))); // 9 chars e.g. MOB9A2B4C
    $chk_dup = $conn->query("SELECT 1 FROM `$mob_table` WHERE referral_code = '$candidate' UNION SELECT 1 FROM `$reg_table` WHERE referral_code = '$candidate' LIMIT 1");
    if (!$chk_dup || $chk_dup->num_rows === 0) {
        $ref_code = $candidate;
        break;
    }
}
if (!$ref_code) {
    $ref_code = 'MOB' . strtoupper(bin2hex(random_bytes(4)));
}

// Generate secure auth token for passwordless dashboard access
$auth_token = bin2hex(random_bytes(24));

$stmt = $conn->prepare("INSERT INTO `$mob_table`
    (created_at, full_name, email, phone, organization, referral_code, auth_token, status)
VALUES
    (NOW(), ?, ?, ?, ?, ?, ?, 'active')");

if (!$stmt) {
    $err = $conn->error;
    $conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database error: ' . $err]);
    exit;
}

$stmt->bind_param('ssssss', $full_name, $email, $phone, $organization, $ref_code, $auth_token);

if (!$stmt->execute()) {
    $err = $stmt->error;
    $stmt->close();
    $conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save mobilizer: ' . $err]);
    exit;
}
$stmt->close();
$conn->close();

$referral_url = $base_domain . '/conference-register?ref=' . $ref_code;
$dashboard_url = $base_domain . '/mobilizer-dashboard?token=' . $auth_token;

// Send email via Brevo
send_mobilizer_email(
    $email,
    $full_name,
    $organization,
    $ref_code,
    $referral_url,
    $dashboard_url,
    false
);

ob_end_clean();
echo json_encode([
    'ok'            => true,
    'is_existing'   => false,
    'message'       => 'Mobilizer registered successfully!',
    'full_name'     => $full_name,
    'organization'  => $organization,
    'referral_code' => $ref_code,
    'referral_link' => $referral_url,
    'token'         => $auth_token,
]);

// ── Email helper function ─────────────────────────────────────────────────────
function send_mobilizer_email($email, $full_name, $organization, $ref_code, $referral_url, $dashboard_url, $is_recovery = false) {
    if (!defined('BREVO_API_KEY') || empty(BREVO_API_KEY)) {
        return;
    }
    
    require_once __DIR__ . '/email-templates.php';

    $rendered = SSCEmailTemplates::mobilizerConfirmation([
        'full_name'     => $full_name,
        'email'         => $email,
        'organization'  => $organization,
        'referral_code' => $ref_code,
        'referral_url'  => $referral_url,
        'dashboard_url' => $dashboard_url,
        'is_recovery'   => $is_recovery,
    ]);

    $subject = $is_recovery 
        ? 'Your SSC 2026 Mobilizer Link & Dashboard Access'
        : 'Welcome to the SSC 2026 Mobilizer Team! 🚀';

    $sender_name  = defined('BREVO_SENDER_NAME')  ? BREVO_SENDER_NAME  : 'Socially Speaking';
    $sender_email = defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@thetakeover2025.com';

    $payload = json_encode([
        'sender'      => ['name' => $sender_name, 'email' => $sender_email],
        'to'          => [['email' => $email, 'name' => $full_name]],
        'subject'     => $subject,
        'htmlContent' => $rendered['html'],
        'textContent' => $rendered['plain'],
    ]);

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'accept: application/json',
        'api-key: ' . BREVO_API_KEY,
        'content-type: application/json',
    ]);
    curl_exec($ch);
    curl_close($ch);
}
