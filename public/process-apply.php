<?php
/**
 * Standalone Form Processor for Socially Speaking Tribe Application
 * This file is independent of WordPress.
 */

// Disable error display in production for security
ini_set('display_errors', 0);
error_reporting(0);

// 1. Database + Brevo Configuration
$config_path = __DIR__ . '/db-config.php';

if (file_exists($config_path)) {
    require_once $config_path;
    $db_name = DB_NAME;
    $db_user = DB_USER;
    $db_pass = DB_PASSWORD;
    $db_host = DB_HOST;
    $table_prefix = TABLE_PREFIX;
} else {
    // Fallbacks (should not be reached in production)
    $db_host = 'localhost';
    $db_user = 'root';
    $db_pass = '';
    $db_name = 'socidfox_sociallyspeaking_wp';
    $table_prefix = 'wp_';
}

$table_name = $table_prefix . 'ssc_applications';

// 2. Connect to Database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Database connection failed.']);
    exit;
}

// 3. Auto-Create Table if missing
$sql_table = "CREATE TABLE IF NOT EXISTS `$table_name` (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NULL,
    birthday VARCHAR(50) NULL,
    age_range VARCHAR(50) NULL,
    stage VARCHAR(200) NULL,
    school VARCHAR(200) NULL,
    course VARCHAR(200) NULL,
    intent TEXT NULL,
    self_area VARCHAR(200) NULL,
    self_reason TEXT NULL,
    thinking TEXT NULL,
    engagement TEXT NULL,
    commitment VARCHAR(200) NULL,
    agreement TINYINT(1) NOT NULL DEFAULT 0,
    raw_payload LONGTEXT NULL,
    PRIMARY KEY (id),
    KEY email (email),
    KEY status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->query($sql_table);

// 4. Handle POST Request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    // Accept JSON or FormData
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!$data) $data = $_POST;

    // Basic Validation
    $required = ['full_name', 'email', 'phone', 'intent', 'self_area', 'self_reason', 'thinking'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['ok' => false, 'error' => "Missing required field: $field"]);
            exit;
        }
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['ok' => false, 'error' => 'Invalid email address.']);
        exit;
    }

    // Sanitize and Prepare
    $full_name = $conn->real_escape_string($data['full_name']);
    $email     = $conn->real_escape_string($data['email']);
    $phone     = $conn->real_escape_string($data['phone']);
    $birthday  = $conn->real_escape_string($data['birthday'] ?? '');
    $age_range = $conn->real_escape_string($data['age_range'] ?? '');
    $stage     = $conn->real_escape_string($data['stage'] ?? '');
    $school    = $conn->real_escape_string($data['school'] ?? '');
    $course    = $conn->real_escape_string($data['course'] ?? '');
    $intent    = $conn->real_escape_string($data['intent'] ?? '');
    $self_area = $conn->real_escape_string($data['self_area'] ?? '');
    $self_reason = $conn->real_escape_string($data['self_reason'] ?? '');
    $thinking  = $conn->real_escape_string($data['thinking'] ?? '');

    $engagement = isset($data['engagement']) ? $data['engagement'] : [];
    $engagement_str = $conn->real_escape_string(is_array($engagement) ? json_encode($engagement) : $engagement);

    $commitment  = $conn->real_escape_string($data['commitment'] ?? '');
    $agreement   = !empty($data['agreement']) ? 1 : 0;
    $raw_payload = $conn->real_escape_string(json_encode($data));
    $now         = date('Y-m-d H:i:s');

    // Check if already applied
    $check = $conn->query("SELECT id FROM `$table_name` WHERE email = '$email' LIMIT 1");
    if ($check && $check->num_rows > 0) {
        echo json_encode(['ok' => false, 'error' => 'This email has already been used to apply.']);
        exit;
    }

    // Insert
    $sql_insert = "INSERT INTO `$table_name`
        (created_at, status, full_name, email, phone, birthday, age_range, stage, school, course, intent, self_area, self_reason, thinking, engagement, commitment, agreement, raw_payload)
        VALUES
        ('$now', 'new', '$full_name', '$email', '$phone', '$birthday', '$age_range', '$stage', '$school', '$course', '$intent', '$self_area', '$self_reason', '$thinking', '$engagement_str', '$commitment', '$agreement', '$raw_payload')";

    if (!$conn->query($sql_insert)) {
        echo json_encode(['ok' => false, 'error' => 'Could not save your application. Please try again.']);
        exit;
    }

    $conn->close();
    $first_name = explode(' ', $data['full_name'])[0];

    // 5. Send emails via Brevo
    if (defined('BREVO_API_KEY')) {
        $sender_name  = defined('BREVO_SENDER_NAME')  ? BREVO_SENDER_NAME  : 'Socially Speaking';
        $sender_email = defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@thetakeover2025.com';

        // Helper
        function sendBrevoEmailApply($to_email, $to_name, $subject, $html_body, $sender_name, $sender_email) {
            $payload = json_encode([
                'sender'      => ['name' => $sender_name, 'email' => $sender_email],
                'to'          => [['email' => $to_email, 'name' => $to_name]],
                'subject'     => $subject,
                'htmlContent' => $html_body,
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

        // Admin notification
        sendBrevoEmailApply(
            'sociallyspeakingtribe@gmail.com',
            'Socially Speaking Admin',
            "New Tribe Application: {$data['full_name']}",
            "<html><body style='font-family:sans-serif;color:#333;'>
              <div style='max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;'>
                <h2 style='color:#6b21a8;'>New Tribe Application</h2>
                <p><strong>Name:</strong> {$data['full_name']}<br>
                <strong>Email:</strong> {$data['email']}<br>
                <strong>Phone:</strong> {$data['phone']}<br>
                <strong>Stage:</strong> {$data['stage']}<br>
                <strong>School:</strong> {$data['school']}<br>
                <strong>Intent:</strong> " . htmlspecialchars(substr($data['intent'], 0, 200)) . "...</p>
              </div>
            </body></html>",
            $sender_name, $sender_email
        );

        // Applicant receipt
        sendBrevoEmailApply(
            $data['email'],
            $data['full_name'],
            'Application Received — Socially Speaking Tribe',
            "<html><body style='font-family:sans-serif;color:#333;'>
              <div style='max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:8px;'>
                <h2 style='color:#6b21a8;'>Hello {$first_name},</h2>
                <p>Thank you for applying to join the <strong>Socially Speaking Tribe</strong>.</p>
                <p>Your application has been received. Our team will review it and get in touch with you soon.</p>
                <p>Please note that submitting an application does not guarantee automatic admission.</p>
                <hr style='border:none;border-top:1px solid #eee;margin:20px 0;'>
                <p><em>Be the standard. Be the difference.</em></p>
                <p><strong>Socially Speaking</strong></p>
              </div>
            </body></html>",
            $sender_name, $sender_email
        );
    }

    echo json_encode(['ok' => true]);
    exit;
}

