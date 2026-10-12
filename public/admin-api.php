<?php
/**
 * Admin API — returns all registration and mobilization data as JSON.
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
$prefix    = defined('TABLE_PREFIX') ? TABLE_PREFIX : '';

// Attempt connection
mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

// Try 127.0.0.1 fallback
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

// Helper: safely query a table and return rows, or empty array on error
function safe_query($conn, $sql) {
    $result = $conn->query($sql);
    if (!$result) {
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
    "SELECT id, submitted_at, status, full_name, email, phone, level FROM `$campus_table` ORDER BY submitted_at DESC"
);

// -----------------------------------------------------------------------
// 2. Takeover Table registrations
// -----------------------------------------------------------------------
$ttb_table = $prefix . 'ttb_registrations';
$ttb_rows = safe_query(
    $conn,
    "SELECT id, created_at, status, full_name, email, phone, profession, payment_method FROM `$ttb_table` ORDER BY created_at DESC"
);

// -----------------------------------------------------------------------
// 3. First Class Formula registrations
// -----------------------------------------------------------------------
$fcf_table = $prefix . 'first_class_formula_registrations';
$fcf_rows = safe_query(
    $conn,
    "SELECT id, submitted_at, status, full_name, email, whatsapp_number, university, academic_level FROM `$fcf_table` ORDER BY submitted_at DESC"
);

// -----------------------------------------------------------------------
// 4. Tribe Applications
// -----------------------------------------------------------------------
$tribe_table = $prefix . 'ssc_applications';
$tribe_rows = safe_query(
    $conn,
    "SELECT id, created_at, status, full_name, email, phone, school, stage FROM `$tribe_table` ORDER BY created_at DESC"
);

// -----------------------------------------------------------------------
// 5. Volunteer Applications
// -----------------------------------------------------------------------
$vol_table = $prefix . 'ssc2026_volunteers';
$vol_rows = safe_query(
    $conn,
    "SELECT id, submitted_at, status, full_name, email, phone, first_choice, second_choice FROM `$vol_table` ORDER BY submitted_at DESC"
);

$vol_status_rows = safe_query(
    $conn,
    "SELECT status, COUNT(*) as cnt FROM `$vol_table` GROUP BY status"
);

$vol_dept_rows = safe_query(
    $conn,
    "SELECT first_choice as dept, COUNT(*) as cnt FROM `$vol_table` GROUP BY first_choice ORDER BY cnt DESC"
);

// -----------------------------------------------------------------------
// 6. SSC 2026 Conference Registrations
// -----------------------------------------------------------------------
$ssc2026_table = $prefix . 'ssc2026_registrations';
$ssc2026_rows = safe_query(
    $conn,
    "SELECT id, created_at AS submitted_at, status, full_name, email, phone, school_org, referral_code, referred_by_code, checked_in_at, checked_in_by FROM `$ssc2026_table` ORDER BY created_at DESC"
);

// -----------------------------------------------------------------------
// 7. Mobilizers & Referral Statistics
// -----------------------------------------------------------------------
$mob_table = $prefix . 'ssc2026_mobilizers';
$mobilizer_rows = safe_query(
    $conn,
    "SELECT 
        m.id, 
        m.created_at, 
        m.full_name, 
        m.email, 
        m.phone, 
        m.organization, 
        m.referral_code, 
        m.status,
        COUNT(DISTINCT r.id) AS total_registrations,
        COUNT(DISTINCT CASE WHEN r.status = 'Checked In' OR r.checked_in_at IS NOT NULL THEN r.id END) AS checked_in_count
     FROM `$mob_table` m
     LEFT JOIN `$ssc2026_table` r ON r.referred_by_code = m.referral_code AND r.status != 'Cancelled'
     GROUP BY m.id
     ORDER BY total_registrations DESC, checked_in_count DESC"
);

// Attendee-to-attendee referrers (attendees whose referral link brought someone)
$attendee_referrers = safe_query(
    $conn,
    "SELECT 
        a.referral_code,
        a.full_name,
        a.email,
        a.school_org AS organization,
        COUNT(DISTINCT r.id) AS total_registrations,
        COUNT(DISTINCT CASE WHEN r.status = 'Checked In' OR r.checked_in_at IS NOT NULL THEN r.id END) AS checked_in_count
     FROM `$ssc2026_table` a
     INNER JOIN `$ssc2026_table` r ON r.referred_by_code = a.referral_code AND r.status != 'Cancelled'
     WHERE a.referral_code IS NOT NULL AND a.referral_code != ''
     GROUP BY a.referral_code
     ORDER BY total_registrations DESC"
);

$conn->close();

// -----------------------------------------------------------------------
// Format Mobilizers
// -----------------------------------------------------------------------
$mobilizers_formatted = [];
foreach ($mobilizer_rows as $m) {
    $tot = (int)$m['total_registrations'];
    $chk = (int)$m['checked_in_count'];
    $rate = $tot > 0 ? round(($chk / $tot) * 100, 1) : 0;
    $mobilizers_formatted[] = [
        'id'                  => 'mob-' . $m['id'],
        'type'                => 'Mobilizer',
        'name'                => $m['full_name'],
        'email'               => $m['email'],
        'phone'               => $m['phone'],
        'organization'        => $m['organization'],
        'referral_code'       => $m['referral_code'],
        'date'                => !empty($m['created_at']) ? substr($m['created_at'], 0, 10) : 'N/A',
        'total_registrations' => $tot,
        'checked_in_count'    => $chk,
        'attendance_rate'     => $rate,
        'status'              => ucfirst($m['status'] ?? 'active'),
    ];
}

// Add attendee referrers to a combined view if requested
$attendee_referrers_formatted = [];
foreach ($attendee_referrers as $ar) {
    $tot = (int)$ar['total_registrations'];
    $chk = (int)$ar['checked_in_count'];
    $rate = $tot > 0 ? round(($chk / $tot) * 100, 1) : 0;
    $attendee_referrers_formatted[] = [
        'id'                  => 'attref-' . $ar['referral_code'],
        'type'                => 'Attendee',
        'name'                => $ar['full_name'],
        'email'               => $ar['email'],
        'organization'        => $ar['organization'] ?: 'Attendee',
        'referral_code'       => $ar['referral_code'],
        'total_registrations' => $tot,
        'checked_in_count'    => $chk,
        'attendance_rate'     => $rate,
    ];
}

// Conference Attendance Calculations
$total_ssc2026_registrations = count($ssc2026_rows);
$total_ssc2026_checked_in = 0;
$total_ssc2026_referred = 0;

foreach ($ssc2026_rows as $r) {
    if ($r['status'] === 'Checked In' || !empty($r['checked_in_at'])) {
        $total_ssc2026_checked_in++;
    }
    if (!empty($r['referred_by_code'])) {
        $total_ssc2026_referred++;
    }
}

$overall_attendance_rate = $total_ssc2026_registrations > 0 
    ? round(($total_ssc2026_checked_in / $total_ssc2026_registrations) * 100, 1) 
    : 0;

// -----------------------------------------------------------------------
// Normalise all rows into a common shape for the Overview table
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
    $is_checked = ($r['status'] === 'Checked In' || !empty($r['checked_in_at']));
    $registrations[] = [
        'id'               => 'ssc2026-' . $r['id'],
        'reg_id'           => $r['id'],
        'form_type'        => 'SSC 2026 Registration',
        'name'             => $r['full_name'],
        'email'            => $r['email'],
        'phone'            => $r['phone'] ?? '',
        'university'       => $r['school_org'] ?: 'Attendee',
        'level'            => 'Attendee',
        'date'             => !empty($r['submitted_at']) ? substr($r['submitted_at'], 0, 10) : 'N/A',
        'status'           => $is_checked ? 'Checked In' : ucfirst($r['status'] ?? 'Pending'),
        'referral_code'    => $r['referral_code'] ?? null,
        'referred_by_code' => $r['referred_by_code'] ?? null,
        'checked_in_at'    => $r['checked_in_at'] ?? null,
        'checked_in_by'    => $r['checked_in_by'] ?? null,
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
$ssc2026_status_map = [
    'Checked In' => $total_ssc2026_checked_in,
    'Pending'    => max(0, $total_ssc2026_registrations - $total_ssc2026_checked_in),
];

// Sort all records newest first
usort($registrations, function ($a, $b) {
    return strcmp($b['date'], $a['date']);
});

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
    'vol_status'     => $vol_status_map,
    'vol_dept'       => $vol_dept_map,
    'ssc2026_status' => $ssc2026_status_map,
    // Mobilization & Referral Reporting Data
    'mobilization' => [
        'total_registrations'     => $total_ssc2026_registrations,
        'total_checked_in'         => $total_ssc2026_checked_in,
        'attendance_rate'          => $overall_attendance_rate,
        'total_mobilizers'         => count($mobilizer_rows),
        'total_referred'           => $total_ssc2026_referred,
        'total_direct'             => max(0, $total_ssc2026_registrations - $total_ssc2026_referred),
        'mobilizers'               => $mobilizers_formatted,
        'attendee_referrers'       => $attendee_referrers_formatted,
    ],
]);
