<?php
/**
 * Standalone form processor for The First Class Formula registration.
 * Mirrors the public PHP handlers used elsewhere in the project:
 * - reads DB credentials from db-config.php
 * - stores the submission in a dedicated table
 * - returns JSON to the frontend
 * - sends a receipt + admin notification when Brevo is configured
 */

ini_set('display_errors', 0);
error_reporting(0);

$config_path = __DIR__ . '/db-config.php';

if (file_exists($config_path)) {
    require_once $config_path;
    $db_name = DB_NAME;
    $db_user = DB_USER;
    $db_pass = DB_PASSWORD;
    $db_host = DB_HOST;
    $table_prefix = TABLE_PREFIX;
} else {
    $db_host = 'localhost';
    $db_user = 'root';
    $db_pass = '';
    $db_name = 'socidfox_sociallyspeaking_wp';
    $table_prefix = 'wp_';
}

function clean_str($value) {
    return trim(strip_tags((string) $value));
}

function sendBrevoEmailFirstClass($to_email, $to_name, $subject, $html_body, $sender_name, $sender_email) {
    if (!defined('BREVO_API_KEY') || BREVO_API_KEY === '') {
        return false;
    }

    $payload = json_encode([
        'sender' => [
            'name' => $sender_name,
            'email' => $sender_email,
        ],
        'to' => [
            [
                'email' => $to_email,
                'name' => $to_name,
            ],
        ],
        'subject' => $subject,
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

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $http_code >= 200 && $http_code < 300 ? $response : false;
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!$data) {
    $data = $_POST;
}

$payload = [
    'full_name' => clean_str($data['full_name'] ?? ''),
    'email' => clean_str($data['email'] ?? ''),
    'whatsapp_number' => clean_str($data['whatsapp_number'] ?? ''),
    'age_range' => clean_str($data['age_range'] ?? ''),
    'university' => clean_str($data['university'] ?? ''),
    'academic_level' => clean_str($data['academic_level'] ?? ''),
    'biggest_challenge' => clean_str($data['biggest_challenge'] ?? ''),
    'most_to_learn' => clean_str($data['most_to_learn'] ?? ''),
    'heard_about' => clean_str($data['heard_about'] ?? ''),
];

$required = [
    'full_name',
    'email',
    'whatsapp_number',
    'age_range',
    'university',
    'academic_level',
    'biggest_challenge',
    'most_to_learn',
    'heard_about',
];

foreach ($required as $field) {
    if ($payload[$field] === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

if (!filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid email address']);
    exit;
}

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
}

$table_name = $table_prefix . 'first_class_formula_registrations';

$sql_table = "CREATE TABLE IF NOT EXISTS `$table_name` (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    submitted_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    age_range VARCHAR(20) NOT NULL,
    university VARCHAR(255) NOT NULL,
    academic_level VARCHAR(100) NOT NULL,
    biggest_challenge TEXT NOT NULL,
    most_to_learn TEXT NOT NULL,
    heard_about VARCHAR(100) NOT NULL,
    raw_payload LONGTEXT NULL,
    PRIMARY KEY (id),
    KEY email (email),
    KEY status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if (!$conn->query($sql_table)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not prepare registration storage']);
    exit;
}

$email = $conn->real_escape_string($payload['email']);
$check = $conn->query("SELECT id FROM `$table_name` WHERE email = '$email' LIMIT 1");
if ($check && $check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'This email has already been used to register']);
    exit;
}

$full_name = $conn->real_escape_string($payload['full_name']);
$whatsapp_number = $conn->real_escape_string($payload['whatsapp_number']);
$age_range = $conn->real_escape_string($payload['age_range']);
$university = $conn->real_escape_string($payload['university']);
$academic_level = $conn->real_escape_string($payload['academic_level']);
$biggest_challenge = $conn->real_escape_string($payload['biggest_challenge']);
$most_to_learn = $conn->real_escape_string($payload['most_to_learn']);
$heard_about = $conn->real_escape_string($payload['heard_about']);
$submitted_at = date('Y-m-d H:i:s');
$raw_payload = $conn->real_escape_string(json_encode($payload));

$sql_insert = "INSERT INTO `$table_name` (
    submitted_at,
    status,
    full_name,
    email,
    whatsapp_number,
    age_range,
    university,
    academic_level,
    biggest_challenge,
    most_to_learn,
    heard_about,
    raw_payload
) VALUES (
    '$submitted_at',
    'new',
    '$full_name',
    '$email',
    '$whatsapp_number',
    '$age_range',
    '$university',
    '$academic_level',
    '$biggest_challenge',
    '$most_to_learn',
    '$heard_about',
    '$raw_payload'
)";

if (!$conn->query($sql_insert)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save your registration right now']);
    exit;
}

$conn->close();

$first_name = explode(' ', $payload['full_name'])[0];
$admin_email = defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@thetakeover2025.com';
$sender_name = defined('BREVO_SENDER_NAME') ? BREVO_SENDER_NAME : 'Socially Speaking';
$sender_email = defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : $admin_email;

sendBrevoEmailFirstClass(
    $admin_email,
    $sender_name . ' Admin',
    'New First Class Formula registration: ' . $payload['full_name'],
    "
        <html>
        <body style=\"font-family: sans-serif; line-height: 1.6; color: #333;\">
          <div style=\"max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;\">
            <h2 style=\"color: #6b21a8;\">New First Class Formula Registration</h2>
            <p>A new registration has been submitted for The First Class Formula webinar.</p>
            <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">
            <p>
              <strong>Name:</strong> {$payload['full_name']}<br>
              <strong>Email:</strong> {$payload['email']}<br>
              <strong>WhatsApp:</strong> {$payload['whatsapp_number']}<br>
              <strong>Age Range:</strong> {$payload['age_range']}<br>
              <strong>University:</strong> {$payload['university']}<br>
              <strong>Academic Level:</strong> {$payload['academic_level']}<br>
              <strong>Biggest Challenge:</strong> {$payload['biggest_challenge']}<br>
              <strong>What they want to learn:</strong> {$payload['most_to_learn']}<br>
              <strong>Heard about us from:</strong> {$payload['heard_about']}
            </p>
          </div>
        </body>
        </html>
    ",
    $sender_name,
    $sender_email
);

sendBrevoEmailFirstClass(
    $payload['email'],
    $payload['full_name'],
    'Your First Class Formula registration has been received',
    "
        <html>
        <body style=\"font-family: sans-serif; line-height: 1.6; color: #333;\">
          <div style=\"max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;\">
            <h2 style=\"color: #6b21a8;\">Hello {$first_name},</h2>
            <p>Thank you for registering for <strong>The First Class Formula</strong>.</p>
            <p>Your registration has been received. We'll send the Zoom link and reminders to your email and WhatsApp number closer to the event.</p>
            <p><strong>Date:</strong> Thursday, 17 September 2026<br>
            <strong>Time:</strong> 7:00 PM GMT+1<br>
            <strong>Venue:</strong> Zoom<br>
            <strong>Attendance:</strong> Free</p>
            <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">
            <p><em>Start university with a formula for excellence.</em></p>
            <p><strong>Socially Speaking</strong></p>
          </div>
        </body>
        </html>
    ",
    $sender_name,
    $sender_email
);

echo json_encode(['ok' => true]);
exit;
