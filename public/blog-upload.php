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

$r2_access_key = getenv('R2_ACCESS_KEY_ID') ?: $_ENV['R2_ACCESS_KEY_ID'] ?? '';
$r2_secret_key = getenv('R2_SECRET_ACCESS_KEY') ?: $_ENV['R2_SECRET_ACCESS_KEY'] ?? '';
$r2_endpoint = getenv('R2_ENDPOINT') ?: $_ENV['R2_ENDPOINT'] ?? '';
$r2_bucket = getenv('R2_BUCKET_NAME') ?: $_ENV['R2_BUCKET_NAME'] ?? '';
$r2_custom_domain = getenv('R2_PUBLIC_URL') ?: $_ENV['R2_PUBLIC_URL'] ?? 'https://media.thetakeovernetwork.org';

if (!$r2_access_key || !$r2_secret_key || !$r2_endpoint) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'R2 credentials not configured']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'No image uploaded']);
    exit;
}

$tmp_name = $_FILES['image']['tmp_name'];
$type = mime_content_type($tmp_name);
if (!in_array($type, ['image/jpeg', 'image/png', 'image/webp'])) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'Invalid image format. Only JPG, PNG, WEBP allowed.']);
    exit;
}

// Ensure the endpoint doesn't have a trailing slash
$r2_endpoint = rtrim($r2_endpoint, '/');

// Generate object key
$ext = 'webp';
if ($type === 'image/jpeg') $ext = 'jpg';
if ($type === 'image/png') $ext = 'png';
$filename = uniqid('blog_') . '.' . $ext;
$object_key = 'blog/featured/' . $filename;
$public_url = rtrim($r2_custom_domain, '/') . '/' . $object_key;

$file_content = file_get_contents($tmp_name);

// --- AWS Signature V4 Implementation for R2 ---
$region = 'auto';
$service = 's3';
$host = parse_url($r2_endpoint, PHP_URL_HOST);
$url = $r2_endpoint . '/' . $r2_bucket . '/' . $object_key;
$content_type = $type;

$date = gmdate('Ymd');
$amz_date = gmdate('Ymd\THis\Z');
$payload_hash = hash('sha256', $file_content);

// Headers
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
$error = curl_error($ch);
curl_close($ch);

if ($http_code >= 200 && $http_code < 300) {
    ob_end_clean();
    echo json_encode(['ok' => true, 'url' => $public_url, 'key' => $object_key]);
} else {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'Upload failed. HTTP ' . $http_code, 'details' => $response]);
}
