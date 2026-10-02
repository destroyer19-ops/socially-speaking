<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$_SERVER['REQUEST_METHOD'] = 'POST';
$json = json_encode([
    'full_name' => 'John Doe',
    'email' => 'john@example.com',
    'phone' => '1234567890',
    'whatsapp' => '1234567890',
    'age_range' => '22-25',
    'gender' => 'Male',
    'state_country' => 'Lagos',
    'school_org' => 'School',
    'occupation' => 'Student',
    'how_heard' => 'Others',
    'attended_before' => 'No',
    'editions_attended' => [],
    'hoping_to_gain' => 'Knowledge'
]);
// We can override file_get_contents inside process-ssc2026.php if we just set it up?
// But it uses file_get_contents('php://input').
// Let's just create a quick wrapper that changes php://input? No, impossible in PHP.
