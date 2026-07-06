<?php
/**
 * Standalone Form Processor for Socially Speaking Tribe Application
 * This file is independent of WordPress.
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 1. Database Configuration
$config_path = dirname(__DIR__) . '/db-config.php';

if (file_exists($config_path)) {
    require_once $config_path;
    $db_name = DB_NAME;
    $db_user = DB_USER;
    $db_pass = DB_PASSWORD;
    $db_host = DB_HOST;
    $table_prefix = TABLE_PREFIX;
} else {
    // Fallbacks
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
    echo json_encode(['ok' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
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
    
    // Get JSON or Form Data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!$data) $data = $_POST;

    // Basic Validation
    $required = ['full_name', 'email', 'phone', 'intent', 'self_area', 'self_reason', 'thinking'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['ok' => false, 'error' => "Please complete all required fields. Missing: $field"]);
            exit;
        }
    }

    // Sanitize and Prepare
    $full_name = $conn->real_escape_string($data['full_name']);
    $email = $conn->real_escape_string($data['email']);
    $phone = $conn->real_escape_string($data['phone']);
    $birthday = $conn->real_escape_string($data['birthday'] ?? '');
    $age_range = $conn->real_escape_string($data['age_range'] ?? '');
    $stage = $conn->real_escape_string($data['stage'] ?? '');
    $school = $conn->real_escape_string($data['school'] ?? '');
    $course = $conn->real_escape_string($data['course'] ?? '');
    $intent = $conn->real_escape_string($data['intent'] ?? '');
    $self_area = $conn->real_escape_string($data['self_area'] ?? '');
    $self_reason = $conn->real_escape_string($data['self_reason'] ?? '');
    $thinking = $conn->real_escape_string($data['thinking'] ?? '');
    
    $engagement = isset($data['engagement']) ? $data['engagement'] : [];
    $engagement_str = is_array($engagement) ? json_encode($engagement) : $engagement;
    $engagement_str = $conn->real_escape_string($engagement_str);

    $commitment = $conn->real_escape_string($data['commitment'] ?? '');
    $agreement = !empty($data['agreement']) ? 1 : 0;
    $raw_payload = $conn->real_escape_string(json_encode($data));
    $now = date('Y-m-d H:i:s');

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
        ('$now', 'accepted', '$full_name', '$email', '$phone', '$birthday', '$age_range', '$stage', '$school', '$course', '$intent', '$self_area', '$self_reason', '$thinking', '$engagement_str', '$commitment', '$agreement', '$raw_payload')";

    if ($conn->query($sql_insert)) {
        // 5. Send Emails
        $to_admin = 'sociallyspeakingtribe@gmail.com';
        $subject_admin = "New Tribe Application: $full_name";
        $body_admin = "New application received.\n\nName: $full_name\nEmail: $email\nPhone: $phone\nIntent: " . substr($intent, 0, 100) . "...";
        $headers = "From: noreply@" . $_SERVER['HTTP_HOST'];
        
        @mail($to_admin, $subject_admin, $body_admin, $headers);
        
        $subject_user = "Application Received: Socially Speaking Tribe";
        $body_user = "Hello $full_name,\n\nYour application to the Socially Speaking Tribe has been received. We will review it and get back to you soon.\n\nSocially Speaking Team";
        @mail($email, $subject_user, $body_user, $headers);

        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'Database insert failed: ' . $conn->error]);
    }
    exit;
}
