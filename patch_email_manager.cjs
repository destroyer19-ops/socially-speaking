const fs = require('fs');
let file = fs.readFileSync('public/email-manager.php', 'utf8');

const testEndpoint = `// ── SEND TEST ────────────────────────────────────────────────────────────────
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

// ── DISPATCH CAMPAIGN ────────────────────────────────────────────────────────`;

file = file.replace("// ── DISPATCH CAMPAIGN ────────────────────────────────────────────────────────", testEndpoint);

fs.writeFileSync('public/email-manager.php', file);
