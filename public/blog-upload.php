<?php
ob_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Cache-Control: no-cache');

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

// 1. Parse .env
$env_path = __DIR__ . '/../.env';
if (file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

$r2_access_key    = getenv('R2_ACCESS_KEY_ID') ?: $_ENV['R2_ACCESS_KEY_ID'] ?? '';
$r2_secret_key    = getenv('R2_SECRET_ACCESS_KEY') ?: $_ENV['R2_SECRET_ACCESS_KEY'] ?? '';
$r2_endpoint      = getenv('R2_ENDPOINT') ?: $_ENV['R2_ENDPOINT'] ?? '';
$r2_bucket        = getenv('R2_BUCKET_NAME') ?: $_ENV['R2_BUCKET_NAME'] ?? '';
$r2_custom_domain = getenv('R2_PUBLIC_URL') ?: $_ENV['R2_PUBLIC_URL'] ?? 'https://media.thetakeovernetwork.org';

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $code = $_FILES['image']['error'] ?? 'no file';
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No image uploaded or upload error code: ' . $code]);
    exit;
}

$tmp_name = $_FILES['image']['tmp_name'];
$file_size = filesize($tmp_name);

// Max 10MB size limit
if ($file_size > 10 * 1024 * 1024) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Image file exceeds maximum limit of 10MB.']);
    exit;
}

$type = mime_content_type($tmp_name);
if (!in_array($type, ['image/jpeg', 'image/png', 'image/webp'])) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid image format. Only JPG, PNG, and WEBP are allowed.']);
    exit;
}

// Subfolder: 'featured' or 'inline'
$subfolder = ($_POST['folder'] ?? 'featured') === 'inline' ? 'inline' : 'featured';

$ext = 'webp';
if ($type === 'image/jpeg') $ext = 'jpg';
if ($type === 'image/png')  $ext = 'png';

$filename   = 'blog_' . bin2hex(random_bytes(6)) . '_' . time() . '.' . $ext;
$object_key = 'blog/' . $subfolder . '/' . $filename;
$public_url = rtrim($r2_custom_domain, '/') . '/' . $object_key;

$file_content = file_get_contents($tmp_name);

// If R2 credentials exist, upload via AWS Signature V4
if (!empty($r2_access_key) && !empty($r2_secret_key) && !empty($r2_endpoint) && !empty($r2_bucket)) {
    $r2_endpoint = rtrim($r2_endpoint, '/');
    $region = 'auto';
    $service = 's3';
    $host = parse_url($r2_endpoint, PHP_URL_HOST);
    $url = $r2_endpoint . '/' . $r2_bucket . '/' . $object_key;
    $content_type = $type;

    $date = gmdate('Ymd');
    $amz_date = gmdate('Ymd\THis\Z');
    $payload_hash = hash('sha256', $file_content);

    $headers = [
        'host' => $host,
        'x-amz-content-sha256' => $payload_hash,
        'x-amz-date' => $amz_date
    ];

    ksort($headers);
    $canonical_headers = '';
    $signed_headers = '';
    foreach ($headers as $k => $v) {
        $canonical_headers .= strtolower($k) . ':' . trim($v) . "\n";
        $signed_headers .= strtolower($k) . ';';
    }
    $signed_headers = rtrim($signed_headers, ';');

    $canonical_request = "PUT\n/" . $r2_bucket . '/' . $object_key . "\n\n" . $canonical_headers . "\n" . $signed_headers . "\n" . $payload_hash;

    $credential_scope = $date . '/' . $region . '/' . $service . '/aws4_request';
    $string_to_sign = "AWS4-HMAC-SHA256\n" . $amz_date . "\n" . $credential_scope . "\n" . hash('sha256', $canonical_request);

    $kDate = hash_hmac('sha256', $date, 'AWS4' . $r2_secret_key, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $string_to_sign, $kSigning);

    $authorization_header = "AWS4-HMAC-SHA256 Credential={$r2_access_key}/{$credential_scope}, SignedHeaders={$signed_headers}, Signature={$signature}";

    $curl_headers = [
        'Authorization: ' . $authorization_header,
        'Content-Type: ' . $content_type,
        'x-amz-content-sha256: ' . $payload_hash,
        'x-amz-date: ' . $amz_date
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $file_content);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $curl_headers);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code >= 200 && $http_code < 300) {
        ob_end_clean();
        echo json_encode(['ok' => true, 'url' => $public_url, 'key' => $object_key, 'storage' => 'r2']);
        exit;
    }
}

// Fallback: Local Storage in public/images/blog/{subfolder}/
$local_dir = __DIR__ . '/images/blog/' . $subfolder;
if (!is_dir($local_dir)) {
    mkdir($local_dir, 0755, true);
}
$target_file = $local_dir . '/' . $filename;
if (move_uploaded_file($tmp_name, $target_file)) {
    $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'thetakeovernetwork.org';
    $fallback_url = $scheme . '://' . $host . '/images/blog/' . $subfolder . '/' . $filename;
    ob_end_clean();
    echo json_encode(['ok' => true, 'url' => $fallback_url, 'key' => $object_key, 'storage' => 'local']);
    exit;
}

ob_end_clean();
http_response_code(500);
echo json_encode(['ok' => false, 'error' => 'Storage upload failed.']);
