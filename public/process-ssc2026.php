<?php
/**
 * SSC 2026 Conference Registration Endpoint
 *
 * Receives JSON payload, validates, generates unique attendee ID,
 * creates QR code, generates unique referral code, tracks referrer attribution,
 * assigns WhatsApp group, stores in MySQL, and sends confirmation e-mail via Brevo.
 */

// Global Exception & Error Handler to prevent raw 500 crashes
set_exception_handler(function ($e) {
    if (ob_get_length()) ob_end_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'error' => 'Server Error: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    exit;
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Capture any stray output (notices, warnings) before headers are sent
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

// ── Load database configuration ──────────────────────────────────────────────
$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require_once $config_path;

// ── Parse JSON body ───────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
    exit;
}

// ── Sanitisation helpers ──────────────────────────────────────────────────────
function ssc_clean(string $value): string {
    return trim(strip_tags($value));
}

function ssc_clean_arr($value): string {
    if (!is_array($value)) return '';
    $clean = array_values(array_filter(array_map('strip_tags', $value)));
    return implode(', ', $clean);
}

// ── Extract + sanitise fields ─────────────────────────────────────────────────
$full_name       = ssc_clean($data['full_name']       ?? '');
$email           = ssc_clean($data['email']           ?? '');
$phone           = ssc_clean($data['phone']           ?? '');
$whatsapp        = ssc_clean($data['whatsapp']        ?? '');
$age_range       = ssc_clean($data['age_range']       ?? '');
$gender          = ssc_clean($data['gender']          ?? '');
$state_country   = ssc_clean($data['state_country']   ?? $data['city_state'] ?? '');
$school_org      = ssc_clean($data['school_org']      ?? '');
$occupation      = ssc_clean($data['occupation']      ?? '');
$how_heard       = ssc_clean($data['how_heard']       ?? '');
$attended_before = ssc_clean($data['attended_before'] ?? '');
$editions_attended = ssc_clean_arr($data['editions_attended'] ?? []);
$hoping_to_gain  = ssc_clean($data['hoping_to_gain'] ?? '');
$incoming_ref    = ssc_clean($data['ref'] ?? $data['referral_code'] ?? '');

// ── Server-side validation ────────────────────────────────────────────────────
$required = [
    'full_name'       => $full_name,
    'email'           => $email,
    'phone'           => $phone,
    'whatsapp'        => $whatsapp,
    'age_range'       => $age_range,
    'gender'          => $gender,
    'state_country'   => $state_country,
    'school_org'      => $school_org,
    'occupation'      => $occupation,
    'how_heard'       => $how_heard,
    'attended_before' => $attended_before,
    'hoping_to_gain'  => $hoping_to_gain,
];

$missing = array_keys(array_filter($required, fn($v) => $v === ''));
if (!empty($missing)) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Missing required fields', 'fields' => $missing]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid email address']);
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
$mob_table = $table_prefix . 'ssc2026_mobilizers';

// ── Ensure tables exist ───────────────────────────────────────────────────────
$conn->query("CREATE TABLE IF NOT EXISTS `$table` (
    id             VARCHAR(24)   NOT NULL,
    created_at     DATETIME      NOT NULL,
    status         VARCHAR(50)   NOT NULL DEFAULT 'Pending',
    full_name      VARCHAR(200)  NOT NULL,
    email          VARCHAR(200)  NOT NULL,
    phone          VARCHAR(50)   NOT NULL,
    whatsapp       VARCHAR(50)   NOT NULL,
    age_range      VARCHAR(20)   NOT NULL,
    gender         VARCHAR(20)   NOT NULL,
    state_country  VARCHAR(100)  NOT NULL DEFAULT '',
    school_org     VARCHAR(200)  NOT NULL,
    occupation     VARCHAR(50)   NOT NULL,
    how_heard      VARCHAR(100)  NOT NULL,
    attended_before VARCHAR(10)  NOT NULL,
    editions_attended TEXT       NULL,
    hoping_to_gain TEXT          NOT NULL,
    qr_code_url    VARCHAR(500)  NULL,
    raw_payload    LONGTEXT      NULL,
    whatsapp_group_id INT        NULL,
    referral_code  VARCHAR(32)   NULL,
    referred_by_code VARCHAR(32) NULL,
    checked_in_at  DATETIME      NULL,
    checked_in_by  VARCHAR(100)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

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

$conn->query("CREATE TABLE IF NOT EXISTS `ssc_whatsapp_groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    capacity INT NOT NULL DEFAULT 1000,
    assigned INT NOT NULL DEFAULT 0,
    link VARCHAR(500) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Seed WhatsApp groups defaults if empty
$count_res = $conn->query("SELECT COUNT(*) AS cnt FROM `ssc_whatsapp_groups`");
if ($count_res) {
    $row = $count_res->fetch_assoc();
    if ($row && $row['cnt'] == 0) {
        $defaults = [
            [1, 'SSC 2026 Attendees 01', 1000, 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4'],
            [2, 'SSC 2026 Attendees 02', 1000, 'https://chat.whatsapp.com/Ca7ZveBe2JX4QOXk4i1wHx'],
            [3, 'SSC 2026 Attendees 03', 1000, 'https://chat.whatsapp.com/DM6bKrrnqXgGR8QFsmOhUF'],
            [4, 'SSC 2026 Attendees 04', 1000, 'https://chat.whatsapp.com/C6CPDyEmLKC70YRuRjsxzM'],
            [5, 'SSC 2026 Attendees 05', 1000, 'https://chat.whatsapp.com/Jt1bUMle06xHLnNrDljKeX'],
        ];
        $ins = $conn->prepare("INSERT INTO `ssc_whatsapp_groups` (sort_order, name, capacity, link) VALUES (?,?,?,?)");
        if ($ins) {
            foreach ($defaults as $d) {
                $ins->bind_param('isis', $d[0], $d[1], $d[2], $d[3]);
                $ins->execute();
            }
            $ins->close();
        }
    }
}

// ── Ensure all required columns and indexes exist ─────────────────────────────
$columns_needed = [
    'state_country'    => "ALTER TABLE `$table` ADD COLUMN state_country VARCHAR(100) NOT NULL DEFAULT ''",
    'qr_code_url'      => "ALTER TABLE `$table` ADD COLUMN qr_code_url VARCHAR(500) NULL",
    'raw_payload'      => "ALTER TABLE `$table` ADD COLUMN raw_payload LONGTEXT NULL",
    'whatsapp_group_id'=> "ALTER TABLE `$table` ADD COLUMN whatsapp_group_id INT NULL",
    'referral_code'    => "ALTER TABLE `$table` ADD COLUMN referral_code VARCHAR(32) NULL",
    'referred_by_code' => "ALTER TABLE `$table` ADD COLUMN referred_by_code VARCHAR(32) NULL",
    'checked_in_at'    => "ALTER TABLE `$table` ADD COLUMN checked_in_at DATETIME NULL",
    'checked_in_by'    => "ALTER TABLE `$table` ADD COLUMN checked_in_by VARCHAR(100) NULL",
];
foreach ($columns_needed as $col => $alter_sql) {
    $chk = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$col'");
    if ($chk && $chk->num_rows === 0) {
        $conn->query($alter_sql);
    }
}

// Update WhatsApp group 1 link as requested
$conn->query("UPDATE ssc_whatsapp_groups SET link = 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4' WHERE id = 1");

// Determine host & base referral domain
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$http_proto = $is_https ? 'https://' : 'https://';
$host = $_SERVER['HTTP_HOST'] ?? 'thetakeovernetwork.org';
$base_domain = $http_proto . $host;

// ── Duplicate-email / phone guard ─────────────────────────────────────────────
$escaped_email = $conn->real_escape_string($email);
$escaped_phone = $conn->real_escape_string($phone);
$dup = $conn->query("SELECT id, whatsapp_group_id, referral_code, qr_code_url FROM `$table` WHERE email = '$escaped_email' OR phone = '$escaped_phone' LIMIT 1");
if ($dup && $dup->num_rows > 0) {
    $row = $dup->fetch_assoc();
    $group_link = null;
    $existing_reg_id = $row['id'] ?? null;
    $existing_ref_code = $row['referral_code'] ?? null;
    $existing_qr = $row['qr_code_url'] ?? null;

    // If existing registration lacks a referral code, generate one now
    if (empty($existing_ref_code)) {
        $existing_ref_code = 'REF' . strtoupper(bin2hex(random_bytes(3)));
        $conn->query("UPDATE `$table` SET referral_code = '$existing_ref_code' WHERE id = '$existing_reg_id'");
    }
    $existing_ref_url = $base_domain . '/conference-register?ref=' . $existing_ref_code;
    
    if (!empty($row['whatsapp_group_id'])) {
        $gid = (int)$row['whatsapp_group_id'];
        $gRes = $conn->query("SELECT link FROM `ssc_whatsapp_groups` WHERE id = $gid LIMIT 1");
        if ($gRes && $gRes->num_rows > 0) {
            $gRow = $gRes->fetch_assoc();
            $group_link = $gRow['link'];
        }
    } else if ($existing_reg_id) {
        $conn->begin_transaction();
        $groupRes = $conn->query("SELECT id, link FROM ssc_whatsapp_groups WHERE active = 1 AND assigned < capacity ORDER BY sort_order ASC, id ASC LIMIT 1 FOR UPDATE");
        if ($groupRes && $groupRes->num_rows > 0) {
            $group = $groupRes->fetch_assoc();
            $new_gid = $group['id'];
            $group_link = $group['link'];
            $conn->query("UPDATE `$table` SET whatsapp_group_id = $new_gid WHERE id = '$existing_reg_id'");
            $conn->query("UPDATE ssc_whatsapp_groups SET assigned = assigned + 1 WHERE id = $new_gid");
        }
        $conn->commit();
    }
    
    $conn->close();
    ob_end_clean();
    http_response_code(200);
    echo json_encode([
        'ok'                  => true, 
        'isDuplicate'         => true, 
        'id'                  => $existing_reg_id,
        'qr_code_url'         => $existing_qr,
        'referral_code'       => $existing_ref_code,
        'referral_link'       => $existing_ref_url,
        'whatsapp_group_link' => $group_link,
        'message'             => 'This email address or phone number is already registered for SSC 2026.'
    ]);
    exit;
}

// ── Validate Referrer Attribution (Server-side) ──────────────────────────────
$valid_referred_by = null;
if (!empty($incoming_ref)) {
    $escaped_ref = $conn->real_escape_string($incoming_ref);
    
    // Check mobilizers table first
    $ref_query = $conn->query("SELECT email, phone FROM `$mob_table` WHERE referral_code = '$escaped_ref' AND status = 'active' LIMIT 1");
    if (!$ref_query || $ref_query->num_rows === 0) {
        // Check attendee registrations table
        $ref_query = $conn->query("SELECT email, phone FROM `$table` WHERE referral_code = '$escaped_ref' LIMIT 1");
    }
    
    if ($ref_query && $ref_query->num_rows > 0) {
        $ref_owner = $ref_query->fetch_assoc();
        // Prevent self-referral
        if (strcasecmp($ref_owner['email'], $email) !== 0 && $ref_owner['phone'] !== $phone) {
            $valid_referred_by = $escaped_ref;
        }
    }
}

// ── Generate Unique Referral Code for New Attendee ───────────────────────────
$attendee_ref_code = null;
for ($attempt = 0; $attempt < 10; $attempt++) {
    $candidate = 'REF' . strtoupper(bin2hex(random_bytes(3)));
    $chk_dup = $conn->query("SELECT 1 FROM `$table` WHERE referral_code = '$candidate' UNION SELECT 1 FROM `$mob_table` WHERE referral_code = '$candidate' LIMIT 1");
    if (!$chk_dup || $chk_dup->num_rows === 0) {
        $attendee_ref_code = $candidate;
        break;
    }
}
if (!$attendee_ref_code) {
    $attendee_ref_code = 'REF' . strtoupper(bin2hex(random_bytes(4)));
}
$referral_url = $base_domain . '/conference-register?ref=' . $attendee_ref_code;

// ── WhatsApp Group Allocation (Transaction) ──────────────────────────────────
$conn->begin_transaction();

$group_id = null;
$group_link = null;
$groupRes = $conn->query("SELECT id, link FROM ssc_whatsapp_groups WHERE active = 1 AND assigned < capacity ORDER BY sort_order ASC, id ASC LIMIT 1 FOR UPDATE");
if ($groupRes && $groupRes->num_rows > 0) {
    $group = $groupRes->fetch_assoc();
    $group_id = $group['id'];
    $group_link = $group['link'];
}

// ── Generate unique registration ID ──────────────────────────────────────────
// Format: SSC26-XXXXXXXX  (8 uppercase hex chars)
$reg_id = 'SSC26-' . strtoupper(bin2hex(random_bytes(4)));

// ── Build QR code URL (Clean attendee identifier, no seat data) ───────────────
$qr_data      = urlencode($reg_id);
$qr_code_url  = "https://api.qrserver.com/v1/create-qr-code/?data={$qr_data}&size=300x300&format=png&margin=10";

// ── Insert record ─────────────────────────────────────────────────────────────
$raw_payload = json_encode($data);

$stmt = $conn->prepare("INSERT INTO `$table`
    (id, created_at, status, full_name, email, phone, whatsapp, age_range, gender,
     state_country, school_org, occupation, how_heard, attended_before,
     editions_attended, hoping_to_gain, qr_code_url, raw_payload, whatsapp_group_id, referral_code, referred_by_code)
VALUES
    (?, NOW(), 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    $err = $conn->error;
    $conn->rollback();
    $conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to prepare statement: ' . $err]);
    exit;
}

$group_id_str = ($group_id !== null) ? (string)$group_id : null;

$stmt->bind_param(
    'ssssssssssssssssssss',
    $reg_id,
    $full_name, $email, $phone, $whatsapp, $age_range, $gender,
    $state_country, $school_org, $occupation, $how_heard, $attended_before,
    $editions_attended, $hoping_to_gain, $qr_code_url, $raw_payload,
    $group_id_str, $attendee_ref_code, $valid_referred_by
);

if (!$stmt->execute()) {
    $err = $stmt->error;
    $stmt->close();
    $conn->rollback();
    $conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save registration: ' . $err]);
    exit;
}
$stmt->close();

// ── Increment WhatsApp assigned counter ──────────────────────────────────────
if ($group_id) {
    $conn->query("UPDATE ssc_whatsapp_groups SET assigned = assigned + 1 WHERE id = $group_id");
}
$conn->commit();
$conn->close();

// ── Send confirmation e-mail via Brevo ────────────────────────────────────────
require_once __DIR__ . '/email-templates.php';

$rendered_email = SSCEmailTemplates::attendeeConfirmation([
    'full_name'     => $full_name,
    'email'         => $email,
    'reg_id'        => $reg_id,
    'state_country' => $state_country,
    'qr_code_url'   => $qr_code_url,
    'referral_code' => $attendee_ref_code,
    'referral_url'  => $referral_url,
    'whatsapp_link' => $group_link ?: 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4',
]);

// Send via Brevo
if (defined('BREVO_API_KEY') && !empty(BREVO_API_KEY)) {
    $brevo_payload = json_encode([
        'sender' => [
            'name'  => defined('BREVO_SENDER_NAME') ? BREVO_SENDER_NAME : 'Socially Speaking',
            'email' => defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@thetakeover2025.com',
        ],
        'to' => [[
            'email' => $email,
            'name'  => $full_name,
        ]],
        'subject'     => 'You\'re registered for SSC 2026 — The Takeover Generation 🎉',
        'htmlContent' => $rendered_email['html'],
        'textContent' => $rendered_email['plain'],
    ]);

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $brevo_payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'accept: application/json',
        'api-key: ' . BREVO_API_KEY,
        'content-type: application/json',
    ]);
    curl_exec($ch);
    curl_close($ch);
}

// ── Respond ───────────────────────────────────────────────────────────────────
ob_end_clean();
echo json_encode([
    'ok'                  => true,
    'id'                  => $reg_id,
    'qr_code_url'         => $qr_code_url,
    'referral_code'       => $attendee_ref_code,
    'referral_link'       => $referral_url,
    'whatsapp_group_link' => $group_link,
]);
