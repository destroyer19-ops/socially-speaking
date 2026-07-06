<?php
/**
 * Email Manager - Admin API
 * Handles fetching sources, recipients, campaign history, and dispatching campaigns via Brevo.
 */

ini_set('display_errors', 0);
error_reporting(0);

ob_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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

// Ensure campaign history table exists
$history_table = TABLE_PREFIX . 'email_campaign_history';
$conn->query("CREATE TABLE IF NOT EXISTS `$history_table` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    recipient_count INT NOT NULL,
    sent_by VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");


$action = $_GET['action'] ?? '';

// ── GET SOURCES ──────────────────────────────────────────────────────────────
if ($action === 'get_sources') {
    $sources = [
        [
            'key' => TABLE_PREFIX . 'ssc2026_registrations',
            'label' => 'SSC 2026 Conference Registrations',
            'columns' => ['id', 'full_name', 'email', 'phone', 'whatsapp', 'gender', 'qr_code_url']
        ],
        [
            'key' => TABLE_PREFIX . 'ssc2026_volunteers',
            'label' => 'SSC 2026 Volunteers',
            'columns' => ['id', 'full_name', 'email', 'phone', 'whatsapp', 'gender', 'status']
        ],
        [
            'key' => TABLE_PREFIX . 'ssc_unilag_waitlist_registrations',
            'label' => 'SSC Campus Tour (UNILAG)',
            'columns' => ['id', 'full_name', 'email', 'phone', 'whatsapp', 'gender', 'university']
        ]
    ];
    ob_end_clean();
    echo json_encode(['ok' => true, 'sources' => $sources]);
    exit;
}

// ── GET RECIPIENTS ───────────────────────────────────────────────────────────
if ($action === 'get_recipients') {
    $source = $_GET['source'] ?? '';
    
    // Validate source to prevent injection
    $allowed_sources = [
        TABLE_PREFIX . 'ssc2026_registrations',
        TABLE_PREFIX . 'ssc2026_volunteers',
        TABLE_PREFIX . 'ssc_unilag_waitlist_registrations'
    ];
    
    if (!in_array($source, $allowed_sources)) {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => 'Invalid source']);
        exit;
    }
    
    // Attempt to query the table
    $result = $conn->query("SELECT * FROM `$source` ORDER BY id DESC");
    $recipients = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $recipients[] = $row;
        }
    }
    
    ob_end_clean();
    echo json_encode(['ok' => true, 'count' => count($recipients), 'recipients' => $recipients]);
    exit;
}

// ── GET CAMPAIGNS ────────────────────────────────────────────────────────────
if ($action === 'get_campaigns') {
    $result = $conn->query("SELECT * FROM `$history_table` ORDER BY id DESC LIMIT 50");
    $campaigns = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $campaigns[] = $row;
        }
    }
    
    ob_end_clean();
    echo json_encode(['ok' => true, 'campaigns' => $campaigns]);
    exit;
}

// ── SEND TEST ────────────────────────────────────────────────────────────────
if ($action === 'send_test' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    $test_email = $data['test_email'] ?? '';
    $subject = $data['subject'] ?? '';
    $html_body = $data['html_body'] ?? '';
    $sample_row = $data['sample_row'] ?? [];
    
    if (empty($test_email) || empty($subject) || empty($html_body)) {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => 'Missing fields for test']);
        exit;
    }
    
    $custom_html = $html_body;
    $first_name = isset($sample_row['full_name']) ? explode(' ', $sample_row['full_name'])[0] : 'Test';
    $custom_html = str_replace('{{first_name}}', htmlspecialchars($first_name), $custom_html);
    
    foreach ($sample_row as $key => $val) {
        $custom_html = str_replace('{{' . $key . '}}', htmlspecialchars((string)$val), $custom_html);
    }
    
    $brevo_payload = json_encode([
        'sender' => [
            'name'  => defined('BREVO_SENDER_NAME') ? BREVO_SENDER_NAME : 'Socially Speaking',
            'email' => defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@sociallyspeaking.com',
        ],
        'to' => [[
            'email' => $test_email,
            'name'  => 'Test User',
        ]],
        'subject'     => '[TEST] ' . $subject,
        'htmlContent' => $custom_html,
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
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    ob_end_clean();
    if ($httpcode >= 200 && $httpcode < 300) {
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'Brevo rejected the test. Code: ' . $httpcode]);
    }
    exit;
}

// ── DISPATCH CAMPAIGN ────────────────────────────────────────────────────────
if ($action === 'dispatch' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!$data) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
        exit;
    }
    
    $subject = $data['subject'] ?? '';
    $html_body = $data['html_body'] ?? '';
    $recipients = $data['recipients'] ?? [];
    $email_col = $data['email_col'] ?? 'email';
    $sent_by = $data['sent_by'] ?? 'Admin';
    
    if (empty($subject) || empty($html_body) || empty($recipients)) {
        ob_end_clean();
        echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
        exit;
    }
    
    $success_count = 0;
    
    foreach ($recipients as $recipient) {
        $email = $recipient[$email_col] ?? '';
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            continue;
        }
        
        // Replace dynamic variables {{column_name}}
        $custom_html = $html_body;
        // Also support first_name shorthand
        $first_name = isset($recipient['full_name']) ? explode(' ', $recipient['full_name'])[0] : '';
        $custom_html = str_replace('{{first_name}}', htmlspecialchars($first_name), $custom_html);
        
        foreach ($recipient as $key => $val) {
            $custom_html = str_replace('{{' . $key . '}}', htmlspecialchars((string)$val), $custom_html);
        }
        
        $brevo_payload = json_encode([
            'sender' => [
                'name'  => defined('BREVO_SENDER_NAME') ? BREVO_SENDER_NAME : 'Socially Speaking',
                'email' => defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@sociallyspeaking.com',
            ],
            'to' => [[
                'email' => $email,
                'name'  => $recipient['full_name'] ?? $email,
            ]],
            'subject'     => $subject,
            'htmlContent' => $custom_html,
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
        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpcode >= 200 && $httpcode < 300) {
            $success_count++;
        }
    }
    
    $status = ($success_count > 0) ? 'Success' : 'Failed';
    
    $stmt = $conn->prepare("INSERT INTO `$history_table` (subject, recipient_count, sent_by, status, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param('siss', $subject, $success_count, $sent_by, $status);
    $stmt->execute();
    
    ob_end_clean();
    echo json_encode([
        'ok' => true,
        'success_count' => $success_count,
        'total' => count($recipients)
    ]);
    exit;
}

ob_end_clean();
echo json_encode(['ok' => false, 'error' => 'Invalid action']);
