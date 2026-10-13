<?php
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');

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

function sendConfirmationEmail($to_email, $to_name) {
    if (!defined('BREVO_API_KEY') || BREVO_API_KEY === '') return false;
    
    $whatsapp_link = "https://chat.whatsapp.com/CUXL6lVz0MKBnBp5YJqC8Y?s=cl&p=i&mlu=4&ilr=4";
    $subject = "Your SSC 2026 Volunteer Application Has Been Received";
    
    $html_body = "
    <p>Hi " . htmlspecialchars($to_name) . ",</p>
    <p>Thank you for applying to volunteer at Socially Speaking Conference 2026.</p>
    <p>We are excited to have you take this first step toward serving with us at <strong>THE TAKEOVER GENERATION</strong>.</p>
    <p>Your application has been received successfully and will be reviewed by our team.</p>
    <p>Please join the official <strong>SSC 2026 Volunteers WhatsApp group</strong> using the link below. This group will be our primary channel for important updates, announcements, training information and next steps.</p>
    <p><strong>Join the SSC 2026 Volunteers WhatsApp Group:</strong><br><a href='$whatsapp_link'>$whatsapp_link</a></p>
    <p>Please join the group with the same name used in your application so our team is able to identify you easily.</p>
    <p>Further information regarding selection, department allocation, volunteer training, call times and responsibilities will be communicated as preparations progress.</p>
    <p>We look forward to building SSC 2026 with you.</p>
    <p><strong>THE TAKEOVER GENERATION</strong><br><strong>Conquer You First.</strong></p>
    <p><strong>Socially Speaking Conference 2026</strong></p>
    ";

    $payload = json_encode([
        'sender' => [
            'name' => defined('BREVO_SENDER_NAME') ? BREVO_SENDER_NAME : 'Socially Speaking',
            'email' => defined('BREVO_SENDER_EMAIL') ? BREVO_SENDER_EMAIL : 'hello@sociallyspeaking.com',
        ],
        'to' => [['email' => $to_email, 'name' => $to_name]],
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
    curl_exec($ch);
    curl_close($ch);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', $db_user, $db_pass, $db_name);
}
if ($conn->connect_errno) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
}

$table_name = $table_prefix . 'ssc2026_volunteers';

$sql_table = "CREATE TABLE IF NOT EXISTS `$table_name` (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    submitted_at DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(200) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    occupation VARCHAR(200) NOT NULL,
    instagram VARCHAR(200) DEFAULT NULL,
    volunteered_ssc VARCHAR(10) NOT NULL,
    volunteered_ssc_role TEXT DEFAULT NULL,
    volunteered_other VARCHAR(10) NOT NULL,
    volunteered_other_role TEXT DEFAULT NULL,
    first_choice VARCHAR(100) NOT NULL,
    second_choice VARCHAR(100) DEFAULT NULL,
    department_reason TEXT NOT NULL,
    skills TEXT NOT NULL,
    willing_second_choice VARCHAR(10) NOT NULL,
    willing_reassign VARCHAR(10) NOT NULL,
    reason_volunteer TEXT NOT NULL,
    excellence_meaning TEXT NOT NULL,
    three_words VARCHAR(200) NOT NULL,
    pressure_response TEXT NOT NULL,
    avail_conference VARCHAR(10) NOT NULL,
    avail_training VARCHAR(10) NOT NULL,
    avail_calltime VARCHAR(10) NOT NULL,
    avail_preevent VARCHAR(10) NOT NULL,
    emergency_name VARCHAR(200) NOT NULL,
    emergency_rel VARCHAR(100) NOT NULL,
    emergency_phone VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if (!$conn->query($sql_table)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to create table']);
    exit;
}

$full_name = clean_str($input['full_name']);
$phone = clean_str($input['phone']);
$whatsapp = clean_str($input['whatsapp']);
$email = clean_str($input['email']);
$age = (int)$input['age'];
$gender = clean_str($input['gender']);
$location = clean_str($input['location']);
$occupation = clean_str($input['occupation']);
$instagram = clean_str($input['instagram'] ?? '');

$escaped_email = $conn->real_escape_string($email);
$escaped_phone = $conn->real_escape_string($phone);
$dup = $conn->query("SELECT id FROM `$table_name` WHERE email = '$escaped_email' OR phone = '$escaped_phone' LIMIT 1");
if ($dup && $dup->num_rows > 0) {
    $conn->close();
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'This email address or phone number has already been submitted for volunteer registration.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO `$table_name` (
    submitted_at, status, full_name, phone, whatsapp, email, age, gender, location, occupation, instagram,
    volunteered_ssc, volunteered_ssc_role, volunteered_other, volunteered_other_role,
    first_choice, second_choice, department_reason, skills, willing_second_choice, willing_reassign,
    reason_volunteer, excellence_meaning, three_words, pressure_response,
    avail_conference, avail_training, avail_calltime, avail_preevent,
    emergency_name, emergency_rel, emergency_phone
) VALUES (NOW(), 'Approved', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");



$volunteered_ssc = clean_str($input['volunteered_ssc']);
$volunteered_ssc_role = clean_str($input['volunteered_ssc_role'] ?? '');
$volunteered_other = clean_str($input['volunteered_other']);
$volunteered_other_role = clean_str($input['volunteered_other_role'] ?? '');

$first_choice = clean_str($input['first_choice']);
$second_choice = clean_str($input['second_choice'] ?? '');
$department_reason = clean_str($input['department_reason']);
$skills = clean_str($input['skills']);
$willing_second_choice = clean_str($input['willing_second_choice']);
$willing_reassign = clean_str($input['willing_reassign']);

$reason_volunteer = clean_str($input['reason_volunteer']);
$excellence_meaning = clean_str($input['excellence_meaning']);
$three_words = clean_str($input['three_words']);
$pressure_response = clean_str($input['pressure_response']);

$avail_conference = clean_str($input['avail_conference']);
$avail_training = clean_str($input['avail_training']);
$avail_calltime = clean_str($input['avail_calltime']);
$avail_preevent = clean_str($input['avail_preevent']);

$emergency_name = clean_str($input['emergency_name']);
$emergency_rel = clean_str($input['emergency_rel']);
$emergency_phone = clean_str($input['emergency_phone']);

$stmt->bind_param("ssssisssssssssssssssssssssssss",
    $full_name, $phone, $whatsapp, $email, $age, $gender, $location, $occupation, $instagram,
    $volunteered_ssc, $volunteered_ssc_role, $volunteered_other, $volunteered_other_role,
    $first_choice, $second_choice, $department_reason, $skills, $willing_second_choice, $willing_reassign,
    $reason_volunteer, $excellence_meaning, $three_words, $pressure_response,
    $avail_conference, $avail_training, $avail_calltime, $avail_preevent,
    $emergency_name, $emergency_rel, $emergency_phone
);

if ($stmt->execute()) {
    $inserted_id = $stmt->insert_id;
    sendConfirmationEmail($email, explode(' ', $full_name)[0]);
    echo json_encode(['ok' => true, 'id' => $inserted_id]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save application']);
}

$stmt->close();
$conn->close();
