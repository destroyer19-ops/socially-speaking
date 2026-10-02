<?php
/**
 * SSC 2026 Conference Registration — PHP backend
 *
 * Replaces the former Supabase Edge Function.
 * Accepts a JSON POST body, stores the registration in MySQL,
 * and sends a confirmation e-mail with a QR code via Brevo.
 *
 * Endpoint: POST /process-ssc2026.php
 */

ini_set('display_errors', 0);
// Let the exception handler catch everything
error_reporting(E_ALL);

ob_start();

set_exception_handler(function($e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Fatal Error: ' . $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
    exit;
});
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return;
    throw new ErrorException($message, 0, $severity, $file, $line);
});

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Pre-flight
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

// ── Load shared Brevo + DB credentials ───────────────────────────────────────
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
// Accept new field name state_country; fall back to old state_country for existing data
$state_country   = ssc_clean($data['state_country']   ?? $data['state_country'] ?? '');
$school_org      = ssc_clean($data['school_org']      ?? '');
$occupation      = ssc_clean($data['occupation']      ?? '');
$how_heard       = ssc_clean($data['how_heard']       ?? '');
$attended_before = ssc_clean($data['attended_before'] ?? '');
$editions_attended = ssc_clean_arr($data['editions_attended'] ?? []);
$hoping_to_gain  = ssc_clean($data['hoping_to_gain'] ?? '');

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

$table = TABLE_PREFIX . 'ssc2026_registrations';

// ── Ensure table exists ───────────────────────────────────────────────────────
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
    state_country     VARCHAR(100)  NOT NULL,
    school_org     VARCHAR(200)  NOT NULL,
    occupation     VARCHAR(50)   NOT NULL,
    how_heard      VARCHAR(100)  NOT NULL,
    attended_before VARCHAR(10)  NOT NULL,
    editions_attended TEXT       NULL,
    hoping_to_gain TEXT          NOT NULL,
    qr_code_url    VARCHAR(500)  NULL,
    raw_payload    LONGTEXT      NULL,
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
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

// Seed defaults if empty
$count_res = $conn->query("SELECT COUNT(*) AS cnt FROM `ssc_whatsapp_groups`");
if ($count_res) {
    $row = $count_res->fetch_assoc();
    if ($row && $row['cnt'] == 0) {
        $defaults = [
            [1, 'SSC 2026 Attendees 01', 1000, 'https://chat.whatsapp.com/HuuOUNSbSnyG6Fbz32DeYJ'],
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

$res_col = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'whatsapp_group_id'");
if ($res_col && $res_col->num_rows === 0) {
    $conn->query("ALTER TABLE `$table` ADD COLUMN whatsapp_group_id INT NULL");
}

// ── Duplicate-email guard ─────────────────────────────────────────────────────
$escaped_email = $conn->real_escape_string($email);
$escaped_phone = $conn->real_escape_string($phone);
$dup = $conn->query("SELECT id, whatsapp_group_id FROM `$table` WHERE email = '$escaped_email' OR phone = '$escaped_phone' LIMIT 1");
if ($dup && $dup->num_rows > 0) {
    $row = $dup->fetch_assoc();
    $group_link = null;
    $existing_reg_id = $row['id'] ?? null;
    
    if (!empty($row['whatsapp_group_id'])) {
        $gid = (int)$row['whatsapp_group_id'];
        $gRes = $conn->query("SELECT link FROM `ssc_whatsapp_groups` WHERE id = $gid LIMIT 1");
        if ($gRes && $gRes->num_rows > 0) {
            $gRow = $gRes->fetch_assoc();
            $group_link = $gRow['link'];
        }
    } else if ($existing_reg_id) {
        // They are registered but have no group (e.g. registered before groups were set up)
        // Let's assign them one now.
        $conn->begin_transaction();
        $groupRes = $conn->query("SELECT id, link FROM ssc_whatsapp_groups WHERE active = 1 AND assigned < capacity ORDER BY sort_order ASC, id ASC LIMIT 1 FOR UPDATE");
        if ($groupRes && $groupRes->num_rows > 0) {
            $group = $groupRes->fetch_assoc();
            $new_gid = $group['id'];
            $group_link = $group['link'];
            
            // Update their registration with the new group
            $conn->query("UPDATE `$table` SET whatsapp_group_id = $new_gid WHERE id = '$existing_reg_id'");
            // Increment assigned count
            $conn->query("UPDATE ssc_whatsapp_groups SET assigned = assigned + 1 WHERE id = $new_gid");
        }
        $conn->commit();
    }
    
    $conn->close();
    ob_end_clean();
    // Return 200 so the frontend can show the success CTA rather than a generic error.
    http_response_code(200);
    echo json_encode([
        'ok' => true, 
        'isDuplicate' => true, 
        'whatsapp_group_link' => $group_link,
        'message' => 'This email address or phone number is already registered for SSC 2026.'
    ]);
    exit;
}

// ── WhatsApp Group Allocation (Transaction) ──────────────────────────────────
$conn->begin_transaction();

$group_id = null;
$group_link = null;
// SELECT ... FOR UPDATE locks the rows until we commit, preventing concurrent overbooking
$groupRes = $conn->query("SELECT id, link FROM ssc_whatsapp_groups WHERE active = 1 AND assigned < capacity ORDER BY sort_order ASC, id ASC LIMIT 1 FOR UPDATE");
if ($groupRes && $groupRes->num_rows > 0) {
    $group = $groupRes->fetch_assoc();
    $group_id = $group['id'];
    $group_link = $group['link'];
}

// ── Generate unique registration ID ──────────────────────────────────────────
// Format: SSC26-XXXXXXXX  (8 uppercase hex chars)
$reg_id = 'SSC26-' . strtoupper(bin2hex(random_bytes(4)));

// ── Build QR code URL ─────────────────────────────────────────────────────────
// Uses the free, no-auth QR Server API. The QR encodes the registration ID
// which can be scanned at the event check-in desk.
$qr_data      = urlencode($reg_id);
$qr_code_url  = "https://api.qrserver.com/v1/create-qr-code/?data={$qr_data}&size=300x300&format=png&margin=10";

// ── Insert record ─────────────────────────────────────────────────────────────
$raw_payload = json_encode($data);

$stmt = $conn->prepare("INSERT INTO `$table`
    (id, created_at, status, full_name, email, phone, whatsapp, age_range, gender,
     state_country, school_org, occupation, how_heard, attended_before,
     editions_attended, hoping_to_gain, qr_code_url, raw_payload, whatsapp_group_id)
VALUES
    (?, NOW(), 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    $conn->rollback();
    $conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to prepare statement: ' . $conn->error]);
    exit;
}

$stmt->bind_param(
    'ssssssssssssssssi',
    $reg_id,
    $full_name, $email, $phone, $whatsapp, $age_range, $gender,
    $state_country, $school_org, $occupation, $how_heard, $attended_before,
    $editions_attended, $hoping_to_gain, $qr_code_url, $raw_payload,
    $group_id
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

// ── Increment assigned counter atomically ────────────────────────────────────
if ($group_id) {
    $conn->query("UPDATE ssc_whatsapp_groups SET assigned = assigned + 1 WHERE id = $group_id");
}
$conn->commit();
$conn->close();

// ── Send confirmation e-mail via Brevo ────────────────────────────────────────
$first_name = explode(' ', $full_name)[0];

$html_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
</head>
<body style=\"margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;\">
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0a0a0a;padding:40px 0;\">
    <tr>
      <td align=\"center\">
        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;\">

          <!-- Header -->
          <tr>
            <td style=\"background:linear-gradient(135deg,#7c3aed 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;\">
              <p style=\"margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.7);\">Socially Speaking Conference</p>
              <h1 style=\"margin:0;font-size:32px;font-weight:900;color:#ffffff;line-height:1.1;\">You're Registered! 🎉</h1>
              <p style=\"margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.85);\">SSC 2026 — The Takeover Generation</p>
              <p style=\"margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.65);\">Saturday, 5 December 2026</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=\"background:#111111;padding:36px 40px;\">
              <p style=\"margin:0 0 16px;font-size:16px;color:#e5e5e5;\">Hi <strong style=\"color:#a78bfa;\">" . htmlspecialchars($first_name) . "</strong>,</p>
              <p style=\"margin:0 0 16px;font-size:15px;color:#d4d4d4;line-height:1.7;\">Thank you for registering for the <strong style=\"color:#ffffff;\">Socially Speaking Conference 2026</strong>. We are thrilled to have you join us for <em>The Takeover Generation</em>.</p>
              <p style=\"margin:0 0 28px;font-size:15px;color:#d4d4d4;line-height:1.7;\">Your registration has been successfully received and a spot has been reserved for you. Keep this email safe — your personal QR code below is your entry pass on the day of the event.</p>

              <!-- Registration ID -->
              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                <tr>
                  <td style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;text-align:center;\">
                    <p style=\"margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#737373;\">Your Registration ID</p>
                    <p style=\"margin:0;font-size:22px;font-weight:900;color:#a78bfa;letter-spacing:0.08em;font-family:monospace;\">" . htmlspecialchars($reg_id) . "</p>
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                <tr>
                  <td style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px;text-align:center;\">
                    <p style=\"margin:0 0 16px;font-size:13px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.12em;\">Your Entry QR Code</p>
                    <img src=\"" . htmlspecialchars($qr_code_url) . "\"
                         alt=\"Your entry QR code — " . htmlspecialchars($reg_id) . "\"
                         width=\"200\" height=\"200\"
                         style=\"display:block;margin:0 auto;border-radius:8px;background:#ffffff;padding:8px;\">
                    <p style=\"margin:14px 0 0;font-size:12px;color:#737373;\">Present this QR code at the registration desk on event day.</p>
                  </td>
                </tr>
              </table>

              <!-- Details summary -->
              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                <tr>
                  <td style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;\">
                    <p style=\"margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#737373;\">Registration Summary</p>
                    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                      <tr><td style=\"padding:6px 0;font-size:13px;color:#737373;width:40%;\">Name</td><td style=\"padding:6px 0;font-size:13px;color:#e5e5e5;font-weight:600;\">" . htmlspecialchars($full_name) . "</td></tr>
                      <tr><td style=\"padding:6px 0;font-size:13px;color:#737373;\">Email</td><td style=\"padding:6px 0;font-size:13px;color:#e5e5e5;\">" . htmlspecialchars($email) . "</td></tr>
                      <tr><td style=\"padding:6px 0;font-size:13px;color:#737373;\">State / Country</td><td style=\"padding:6px 0;font-size:13px;color:#e5e5e5;\">" . htmlspecialchars($state_country) . "</td></tr>
                      <tr><td style=\"padding:6px 0;font-size:13px;color:#737373;\">Status</td><td style=\"padding:6px 0;font-size:13px;\"><span style=\"background:#7c3aed22;color:#a78bfa;border-radius:6px;padding:2px 10px;font-size:12px;font-weight:700;\">Registered</span></td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style=\"margin:0 0 16px;font-size:15px;color:#d4d4d4;line-height:1.7;\">To receive important conference updates, announcements, and information leading up to the event, join the official SSC 2026 WhatsApp community:</p>
              <table cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\">
                <tr>
                  <td style=\"background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:10px;padding:1px;\">
                    <a href=\"https://chat.whatsapp.com/ssc2026\"
                       style=\"display:inline-block;background:#111111;border-radius:9px;padding:14px 28px;font-size:14px;font-weight:700;color:#a78bfa;text-decoration:none;\">
                      Join the WhatsApp Community →
                    </a>
                  </td>
                </tr>
              </table>

              <p style=\"margin:0;font-size:14px;color:#737373;line-height:1.7;\">If you have any questions, reach us on Instagram at <a href=\"https://instagram.com/sociallyspeaking.tribe\" style=\"color:#a78bfa;text-decoration:none;\">@sociallyspeaking.tribe</a>.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=\"background:#0d0d0d;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #1f1f1f;\">
              <p style=\"margin:0 0 6px;font-size:13px;font-weight:700;color:#ffffff;\">Socially Speaking</p>
              <p style=\"margin:0;font-size:12px;color:#525252;\">© 2026 Socially Speaking. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
";

// Send via Brevo
$brevo_payload = json_encode([
    'sender' => [
        'name'  => BREVO_SENDER_NAME,
        'email' => BREVO_SENDER_EMAIL,
    ],
    'to' => [[
        'email' => $email,
        'name'  => $full_name,
    ]],
    'subject'     => 'You\'re registered for SSC 2026 — The Takeover Generation 🎉',
    'htmlContent' => $html_body,
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

// ── Respond ───────────────────────────────────────────────────────────────────
ob_end_clean();
echo json_encode([
    'ok'                  => true,
    'id'                  => $reg_id,
    'qr_code_url'         => $qr_code_url,
    'whatsapp_group_link' => $group_link,
]);
