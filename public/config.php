<?php
/**
 * Socially Speaking — UNILAG Chapter
 * Site configuration
 *
 * Edit the values below to match your real deployment.
 */

// Load parent platform DB and email configurations
require_once __DIR__ . '/db-config.php';

// ---- General ----
define('SITE_NAME', 'Socially Speaking — UNILAG Chapter');
define('SITE_URL', 'https://yourdomain.com'); // no trailing slash
define('WHATSAPP_INVITE_LINK', 'https://chat.whatsapp.com/your-invite-code');

// ---- Notification email addresses ----
define('ADMIN_EMAIL', BREVO_SENDER_EMAIL);       // receives a copy of every new application
define('FROM_EMAIL', BREVO_SENDER_EMAIL);        // "From" address used on outgoing mail
define('FROM_NAME', BREVO_SENDER_NAME . ' — UNILAG Chapter');

// ---- Storage ----
// Applications are stored as JSON lines in this file. Swap this out for a
// real database (MySQL etc.) if/when the chapter outgrows file storage.
define('DATA_DIR', __DIR__ . '/data');
define('REGISTRATIONS_FILE', DATA_DIR . '/registrations.json');

// ---- Admin panel ----
// Change this immediately. Consider moving to an environment variable
// instead of hard-coding it once this goes live.
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'change-this-password');

// ---- Timezone ----
date_default_timezone_set('Africa/Lagos');

// ---- Sessions (used by the admin panel) ----
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Make sure the data directory exists and isn't web-browsable.
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

/**
 * Send email via Brevo API using standard platform configurations.
 */
if (!function_exists('sendBrevoEmail')) {
    function sendBrevoEmail($to_email, $to_name, $subject, $html_body) {
        $payload = [
            'sender' => [
                'name' => BREVO_SENDER_NAME,
                'email' => BREVO_SENDER_EMAIL,
            ],
            'to' => [
                [
                    'email' => $to_email,
                    'name' => $to_name,
                ],
            ],
            'subject' => $subject,
            'htmlContent' => $html_body,
        ];

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'accept: application/json',
            'api-key: ' . BREVO_API_KEY,
            'content-type: application/json',
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        return [
            'ok' => ($http_code >= 200 && $http_code < 300),
            'code' => $http_code,
            'response' => $response,
            'error' => $curl_error
        ];
    }
}

/**
 * Establish a DB connection and ensure the registrations table exists.
 */
function get_db_connection() {
    static $conn = null;
    if ($conn === null) {
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
        if ($conn->connect_error && DB_HOST === 'localhost') {
            $conn = @new mysqli('127.0.0.1', DB_USER, DB_PASSWORD, DB_NAME);
        }
        if ($conn->connect_error) {
            die("Database connection failed: " . $conn->connect_error);
        }
        
        $table_name = TABLE_PREFIX . 'ssc_unilag_waitlist_registrations';
        $sql_table = "CREATE TABLE IF NOT EXISTS `$table_name` (
            id VARCHAR(50) NOT NULL,
            submitted_at DATETIME NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            full_name VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            gender VARCHAR(20) NOT NULL,
            date_of_birth VARCHAR(50) NOT NULL,
            faculty VARCHAR(100) NOT NULL,
            department VARCHAR(100) NOT NULL,
            level VARCHAR(20) NOT NULL,
            student_id VARCHAR(50) NOT NULL,
            instagram_handle VARCHAR(100) NULL,
            linkedin_profile VARCHAR(200) NULL,
            about_you TEXT NOT NULL,
            interests TEXT NULL,
            skills_to_develop TEXT NOT NULL,
            existing_skills TEXT NOT NULL,
            activities_of_interest TEXT NULL,
            volunteer_interest VARCHAR(100) NOT NULL,
            volunteer_team VARCHAR(100) NULL,
            time_commitment VARCHAR(100) NOT NULL,
            why_select_you TEXT NOT NULL,
            problem_to_solve TEXT NOT NULL,
            impact_meaning TEXT NOT NULL,
            commitment_understand TEXT NOT NULL,
            commitment_values TEXT NOT NULL,
            is_present TINYINT(1) NOT NULL DEFAULT 0,
            raw_payload LONGTEXT NULL,
            PRIMARY KEY (id),
            KEY email (email),
            KEY status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $conn->query($sql_table);
        // Ensure is_present exists for tables already created
        @$conn->query("ALTER TABLE `$table_name` ADD `is_present` TINYINT(1) NOT NULL DEFAULT 0");
    }
    return $conn;
}
