<?php
/**
 * Webhook for Paystack - The Takeover Table
 */

ini_set('display_errors', 0);
error_reporting(0);

$config_path = __DIR__ . '/db-config.php';
if (file_exists($config_path)) {
    require_once $config_path;
}

// Only proceed if it's a POST request
if ((strtoupper($_SERVER['REQUEST_METHOD']) != 'POST' ) || !array_key_exists('HTTP_X_PAYSTACK_SIGNATURE', $_SERVER) ) {
    exit();
}

$input = @file_get_contents("php://input");
// Make sure PAYSTACK_SECRET_KEY is defined
$secret = defined('PAYSTACK_SECRET_KEY') ? PAYSTACK_SECRET_KEY : '';

// Verify signature
if($_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] !== hash_hmac('sha512', $input, $secret)) {
    exit();
}

$event = json_decode($input);

if ($event->event == 'charge.success') {
    $reference = $event->data->reference;
    
    $db_name = defined('DB_NAME') ? DB_NAME : 'socidfox_sociallyspeaking_wp';
    $db_user = defined('DB_USER') ? DB_USER : 'root';
    $db_pass = defined('DB_PASSWORD') ? DB_PASSWORD : '';
    $db_host = defined('DB_HOST') ? DB_HOST : 'localhost';
    $table_prefix = defined('TABLE_PREFIX') ? TABLE_PREFIX : 'wp_';
    $table_name = $table_prefix . 'ttb_registrations';

    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if (!$conn->connect_error) {
        $reference = $conn->real_escape_string($reference);
        
        $result = $conn->query("SELECT * FROM `$table_name` WHERE paystack_reference = '$reference' AND status = 'pending' LIMIT 1");
        
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $id = $row['id'];
            
            // Update status to paid
            $conn->query("UPDATE `$table_name` SET status = 'paid' WHERE id = $id");
            
            // Send Email using Brevo
            if (defined('BREVO_API_KEY')) {
                // The newly requested sender email exclusively for this program
                $sender_name  = 'The Takeover Table';
                $sender_email = 'info@sociallyspeakingtribe.com';
                
                function sendBrevoEmailTTB($to_email, $to_name, $subject, $html_body, $sender_name, $sender_email) {
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

                // Send applicant receipt with QR Code
                $qr_data = urlencode("TTB-TICKET-" . $reference);
                $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . $qr_data;

                sendBrevoEmailTTB(
                    $row['email'],
                    $row['full_name'],
                    'Ticket Confirmed — The Takeover Table',
                    "<html><body style='font-family:sans-serif;color:#333;'>
                      <div style='max-width:600px;margin:0 auto;padding:20px;border:1px solid #d4af37;border-radius:8px;text-align:center;'>
                        <h2 style='color:#d4af37;'>Hello {$row['full_name']},</h2>
                        <p>Thank you for registering for <strong>The Takeover Table</strong>. Your payment has been confirmed.</p>
                        <p>This email serves as your official ticket confirmation. Please present the QR code below at the venue for access.</p>
                        
                        <div style='margin: 30px 0;'>
                          <img src='{$qr_url}' alt='Your Ticket QR Code' style='width: 200px; height: 200px; border: 4px solid #06091a; border-radius: 8px;' />
                          <p style='font-family: monospace; font-size: 14px; margin-top: 10px;'>TICKET REF: TTB-{$row['id']}</p>
                        </div>
                        
                        <hr style='border:none;border-top:1px solid #eee;margin:20px 0;'>
                        <p>We will send you the secret venue details closer to the date.</p>
                        <p><em>One Table. Three Nations. A New Generation of Leaders.</em></p>
                        <p><strong>The Takeover Table Team</strong></p>
                      </div>
                    </body></html>",
                    $sender_name, $sender_email
                );

                // Send Admin notification
                sendBrevoEmailTTB(
                    $sender_email, // Send it back to the program's official email
                    'TTB Admin',
                    "Payment Confirmed: {$row['full_name']}",
                    "<html><body><h2>Payment Confirmed for The Takeover Table</h2><p>Name: {$row['full_name']}<br>Email: {$row['email']}<br>Ticket: {$row['payment_method']}</p></body></html>",
                    $sender_name, $sender_email
                );
            }
        }
        $conn->close();
    }
}
http_response_code(200);
