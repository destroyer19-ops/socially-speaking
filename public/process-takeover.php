<?php
/**
 * Standalone Form Processor for The Takeover Table
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

$table_name = $table_prefix . 'ttb_registrations';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Database connection failed.']);
    exit;
}

$sql_table = "CREATE TABLE IF NOT EXISTS `$table_name` (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paystack_reference VARCHAR(100) NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NULL,
    country_city VARCHAR(200) NULL,
    profession VARCHAR(200) NULL,
    building TEXT NULL,
    why_attend TEXT NULL,
    payment_method VARCHAR(100) NULL,
    raw_payload LONGTEXT NULL,
    PRIMARY KEY (id),
    KEY email (email),
    KEY paystack_reference (paystack_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
$conn->query($sql_table);

// Ensure paystack_reference exists if table was already created earlier
$conn->query("ALTER TABLE `$table_name` ADD COLUMN paystack_reference VARCHAR(100) NULL AFTER status");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!$data) $data = $_POST;

    $required = ['full_name', 'email', 'phone'];
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

    $full_name = $conn->real_escape_string($data['full_name']);
    $email     = $conn->real_escape_string($data['email']);
    $phone     = $conn->real_escape_string($data['phone']);
    $country_city = $conn->real_escape_string($data['country_city'] ?? '');
    $profession = $conn->real_escape_string($data['profession'] ?? '');
    $building  = $conn->real_escape_string($data['building'] ?? '');
    $why_attend = $conn->real_escape_string($data['why_attend'] ?? '');
    $payment_method = $conn->real_escape_string($data['payment_method'] ?? '');
    $raw_payload = $conn->real_escape_string(json_encode($data));
    $now = date('Y-m-d H:i:s');
    $reference = 'TTB_' . uniqid() . '_' . time();

    $sql_insert = "INSERT INTO `$table_name`
        (created_at, status, paystack_reference, full_name, email, phone, country_city, profession, building, why_attend, payment_method, raw_payload)
        VALUES
        ('$now', 'pending', '$reference', '$full_name', '$email', '$phone', '$country_city', '$profession', '$building', '$why_attend', '$payment_method', '$raw_payload')";

    if (!$conn->query($sql_insert)) {
        echo json_encode(['ok' => false, 'error' => 'Could not save your registration. Please try again.']);
        exit;
    }
    
    $conn->close();

    // Determine amount based on ticket option (in kobo)
    $amount = 80000;
    if (strpos(strtolower($payment_method), 'standard') !== false) {
        $amount = 100000;
    } elseif (strpos(strtolower($payment_method), 'final') !== false) {
        $amount = 120000;
    }

    // Initialize Paystack Payment
    if (defined('PAYSTACK_SECRET_KEY') && PAYSTACK_SECRET_KEY !== 'sk_live_your_secret_key_here') {
        $paystack_url = "https://api.paystack.co/transaction/initialize";
        $fields = [
            'email' => $data['email'],
            'amount' => $amount * 100, // Kobo
            'reference' => $reference,
            'callback_url' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]/takeover-table",
            'metadata' => [
                'full_name' => $data['full_name'],
                'program' => 'The Takeover Table'
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $paystack_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
            "Cache-Control: no-cache",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            echo json_encode(['ok' => false, 'error' => 'Payment initiation failed: ' . $err]);
            exit;
        }

        $tranx = json_decode($result, true);
        if (!$tranx['status']) {
            echo json_encode(['ok' => false, 'error' => 'Paystack Error: ' . $tranx['message']]);
            exit;
        }

        // Return the authorization URL to the frontend so it can redirect
        echo json_encode(['ok' => true, 'authorization_url' => $tranx['data']['authorization_url']]);
        exit;
    } else {
        // Fallback for when Paystack is not configured yet
        echo json_encode([
            'ok' => true, 
            'authorization_url' => '#',
            'warning' => 'Paystack is not configured. Add PAYSTACK_SECRET_KEY to db-config.php'
        ]);
        exit;
    }
}
