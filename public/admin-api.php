<?php
/**
 * Admin API — returns all registration data as JSON.
 * Self-contained: does NOT require config.php to avoid session_start() / die() side-effects.
 */

// Capture any stray output (warnings, notices) so they don't corrupt JSON
ob_start();

// Suppress all display errors — we handle errors ourselves
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Always send JSON, with CORS open for the React dev server
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit;
}

// Load DB credentials from db-config.php
$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found', 'data' => []]);
    exit;
}
require_once $config_path;

$db_host   = defined('DB_HOST')      ? DB_HOST      : 'localhost';
$db_user   = defined('DB_USER')      ? DB_USER      : 'root';
$db_pass   = defined('DB_PASSWORD')  ? DB_PASSWORD  : '';
$db_name   = defined('DB_NAME')      ? DB_NAME      : '';
$prefix    = defined('TABLE_PREFIX') ? TABLE_PREFIX : 'wp_';

// Attempt connection
mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

// Try 127.0.0.1 fallback (common on cPanel / shared hosts)
if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', $db_user, $db_pass, $db_name);
}

if ($conn->connect_errno) {
    ob_end_clean();
    echo json_encode([
        'ok'    => false,
        'error' => 'Database connection failed: ' . $conn->connect_error,
        'data'  => []
    ]);
    exit;
}

$conn->set_charset('utf8mb4');

// -----------------------------------------------------------------------
// Helper: safely query a table and return rows, or empty array on error
// -----------------------------------------------------------------------
function safe_query($conn, $sql, $table_name) {
    $result = $conn->query($sql);
    if (!$result) {
        // Table likely doesn't exist yet — return empty gracefully
        return [];
    }
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    return $rows;
}

// -----------------------------------------------------------------------
// 1. Campus Chapter registrations
// -----------------------------------------------------------------------
$campus_table = $prefix . 'ssc_unilag_waitlist_registrations';
$campus_rows = safe_query(
    $conn,
    "SELECT id, submitted_at, status, full_name, email, phone, level FROM `$campus_table` ORDER BY submitted_at DESC",
    $campus_table
);

// -----------------------------------------------------------------------
// 2. Takeover Table registrations
// -----------------------------------------------------------------------
$ttb_table = $prefix . 'ttb_registrations';
$ttb_rows = safe_query(
    $conn,
    "SELECT id, created_at, status, full_name, email, phone, profession, payment_method FROM `$ttb_table` ORDER BY created_at DESC",
    $ttb_table
);

// -----------------------------------------------------------------------
// 3. First Class Formula registrations
// -----------------------------------------------------------------------
$fcf_table = $prefix . 'first_class_formula_registrations';
$fcf_rows = safe_query(
    $conn,
    "SELECT id, submitted_at, status, full_name, email, whatsapp_number, university, academic_level FROM `$fcf_table` ORDER BY submitted_at DESC",
    $fcf_table
);

// -----------------------------------------------------------------------
// 4. Tribe Applications
// -----------------------------------------------------------------------
$tribe_table = $prefix . 'ssc_applications';
$tribe_rows = safe_query(
    $conn,
    "SELECT id, created_at, status, full_name, email, phone, school, stage FROM `$tribe_table` ORDER BY created_at DESC",
    $tribe_table
);

// -----------------------------------------------------------------------
// 5. Volunteer Applications (with department + status data)
// -----------------------------------------------------------------------
$vol_table = $prefix . 'ssc2026_volunteers';
$vol_rows = safe_query(
    $conn,
    "SELECT id, submitted_at, status, full_name, email, phone, first_choice, second_choice FROM `$vol_table` ORDER BY submitted_at DESC",
    $vol_table
);

// Volunteer status breakdown
$vol_status_rows = safe_query(
    $conn,
    "SELECT status, COUNT(*) as cnt FROM `$vol_table` GROUP BY status",
    $vol_table
);

// Volunteer department breakdown (first choice)
$vol_dept_rows = safe_query(
    $conn,
    "SELECT first_choice as dept, COUNT(*) as cnt FROM `$vol_table` GROUP BY first_choice ORDER BY cnt DESC",
    $vol_table
);

// -----------------------------------------------------------------------
// 6. SSC 2026 Conference Registrations
// -----------------------------------------------------------------------
// Try a dedicated local table first; fall back gracefully if absent.
$ssc2026_table = $prefix . 'ssc2026_registrations';
$ssc2026_rows = safe_query(
    $conn,
    "SELECT id, created_at AS submitted_at, status, full_name, email, phone FROM `$ssc2026_table` ORDER BY created_at DESC",
    $ssc2026_table
);

$conn->close();

// -----------------------------------------------------------------------
// Normalise all rows into a common shape
// -----------------------------------------------------------------------
$registrations = [];

foreach ($campus_rows as $r) {
    $registrations[] = [
        'id'        => 'campus-' . $r['id'],
        'form_type' => 'Campus Chapter',
        'name'      => $r['full_name'],
        'email'     => $r['email'],
        'phone'     => $r['phone'] ?? '',
        'university'=> 'UNILAG',
        'level'     => $r['level'] ?? 'N/A',
        'date'      => !empty($r['submitted_at']) ? substr($r['submitted_at'], 0, 10) : 'N/A',
        'status'    => ucfirst($r['status'] ?? 'pending'),
    ];
}

foreach ($ttb_rows as $r) {
    $registrations[] = [
        'id'        => 'ttb-' . $r['id'],
        'form_type' => 'Takeover Table',
        'name'      => $r['full_name'],
        'email'     => $r['email'],
        'phone'     => $r['phone'] ?? '',
        'university'=> 'N/A',
        'level'     => $r['profession'] ?? 'N/A',
        'date'      => !empty($r['created_at']) ? substr($r['created_at'], 0, 10) : 'N/A',
        'status'    => ucfirst($r['status'] ?? 'pending'),
    ];
}

foreach ($fcf_rows as $r) {
    $registrations[] = [
        'id'        => 'fcf-' . $r['id'],
        'form_type' => 'First Class Formula',
        'name'      => $r['full_name'],
        'email'     => $r['email'],
        'phone'     => $r['whatsapp_number'] ?? '',
        'university'=> $r['university'] ?? 'N/A',
        'level'     => $r['academic_level'] ?? 'N/A',
        'date'      => !empty($r['submitted_at']) ? substr($r['submitted_at'], 0, 10) : 'N/A',
        'status'    => ucfirst($r['status'] ?? 'new'),
    ];
}

foreach ($tribe_rows as $r) {
    $registrations[] = [
        'id'        => 'tribe-' . $r['id'],
        'form_type' => 'Tribe Application',
        'name'      => $r['full_name'],
        'email'     => $r['email'],
        'phone'     => $r['phone'] ?? '',
        'university'=> $r['school'] ?? 'N/A',
        'level'     => $r['stage'] ?? 'N/A',
        'date'      => !empty($r['created_at']) ? substr($r['created_at'], 0, 10) : 'N/A',
        'status'    => ucfirst($r['status'] ?? 'new'),
    ];
}

foreach ($vol_rows as $r) {
    $registrations[] = [
        'id'        => 'volunteer-' . $r['id'],
        'form_type' => 'Volunteer Application',
        'name'      => $r['full_name'],
        'email'     => $r['email'],
        'phone'     => $r['phone'] ?? '',
        'university'=> $r['first_choice'] ?? 'N/A',
        'level'     => 'Volunteer',
        'date'      => !empty($r['submitted_at']) ? substr($r['submitted_at'], 0, 10) : 'N/A',
        'status'    => ucfirst($r['status'] ?? 'Pending'),
    ];
}

foreach ($ssc2026_rows as $r) {
    $registrations[] = [
        'id'        => 'ssc2026-' . $r['id'],
        'form_type' => 'SSC 2026 Registration',
        'name'      => $r['full_name'],
        'email'     => $r['email'],
        'phone'     => $r['phone'] ?? '',
        'university'=> 'N/A',
        'level'     => 'Attendee',
        'date'      => !empty($r['submitted_at']) ? substr($r['submitted_at'], 0, 10) : 'N/A',
        'status'    => ucfirst($r['status'] ?? 'Pending'),
    ];
}

// Build volunteer status map
$vol_status_map = [];
foreach ($vol_status_rows as $r) {
    $vol_status_map[ucfirst($r['status'])] = (int) $r['cnt'];
}

// Build volunteer department map
$vol_dept_map = [];
foreach ($vol_dept_rows as $r) {
    if (!empty($r['dept'])) {
        $vol_dept_map[$r['dept']] = (int) $r['cnt'];
    }
}

// SSC 2026 conference status counts
$ssc2026_status_map = [];
foreach ($ssc2026_rows as $r) {
    $s = ucfirst($r['status'] ?? 'Pending');
    $ssc2026_status_map[$s] = ($ssc2026_status_map[$s] ?? 0) + 1;
}

// Sort all records newest first
usort($registrations, function ($a, $b) {
    return strcmp($b['date'], $a['date']);
});

// Discard any stray output captured by ob_start() so JSON is clean
ob_end_clean();

echo json_encode([
    'ok'    => true,
    'data'  => $registrations,
    'counts' => [
        'campus'    => count($campus_rows),
        'ttb'       => count($ttb_rows),
        'fcf'       => count($fcf_rows),
        'tribe'     => count($tribe_rows),
        'volunteer' => count($vol_rows),
        'ssc2026'   => count($ssc2026_rows),
    ],
    'vol_status'   => $vol_status_map,
    'vol_dept'     => $vol_dept_map,
    'ssc2026_status' => $ssc2026_status_map,
]);
