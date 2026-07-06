<?php
/**
 * Handles submission of the membership registration form.
 * Validates input, stores it, sends notification + receipt emails,
 * then redirects back to a thank-you page (POST/redirect/GET pattern).
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: register.php');
    exit;
}

/** Trim + strip tags from a scalar string field. */
function clean_str($value) {
    return trim(strip_tags((string) $value));
}

/** Clean an array of strings (used for checkbox groups). */
function clean_array($value) {
    if (!is_array($value)) return [];
    return array_values(array_filter(array_map('clean_str', $value), function ($v) {
        return $v !== '';
    }));
}

$data = [
    'full_name'             => clean_str($_POST['full_name'] ?? ''),
    'email'                 => clean_str($_POST['email'] ?? ''),
    'phone'                 => clean_str($_POST['phone'] ?? ''),
    'gender'                => clean_str($_POST['gender'] ?? ''),
    'date_of_birth'         => clean_str($_POST['date_of_birth'] ?? ''),
    'faculty'               => clean_str($_POST['faculty'] ?? ''),
    'department'            => clean_str($_POST['department'] ?? ''),
    'level'                 => clean_str($_POST['level'] ?? ''),
    'student_id'            => clean_str($_POST['student_id'] ?? ''),
    'instagram_handle'      => clean_str($_POST['instagram_handle'] ?? ''),
    'linkedin_profile'      => clean_str($_POST['linkedin_profile'] ?? ''),
    'about_you'             => clean_str($_POST['about_you'] ?? ''),
    'interests'             => clean_array($_POST['interests'] ?? []),
    'skills_to_develop'     => clean_str($_POST['skills_to_develop'] ?? ''),
    'existing_skills'       => clean_str($_POST['existing_skills'] ?? ''),
    'activities_of_interest'=> clean_array($_POST['activities_of_interest'] ?? []),
    'volunteer_interest'    => clean_str($_POST['volunteer_interest'] ?? ''),
    'volunteer_team'        => clean_str($_POST['volunteer_team'] ?? ''),
    'time_commitment'       => clean_str($_POST['time_commitment'] ?? ''),
    'why_select_you'        => clean_str($_POST['why_select_you'] ?? ''),
    'problem_to_solve'      => clean_str($_POST['problem_to_solve'] ?? ''),
    'impact_meaning'        => clean_str($_POST['impact_meaning'] ?? ''),
    'commitment_understand' => clean_str($_POST['commitment_understand'] ?? ''),
    'commitment_values'     => clean_str($_POST['commitment_values'] ?? ''),
];

// ---- Server-side validation (mirrors the "required" fields in the form) ----
$required = [
    'full_name', 'email', 'phone', 'gender', 'date_of_birth', 'faculty', 'department',
    'level', 'student_id', 'about_you', 'skills_to_develop', 'existing_skills',
    'volunteer_interest', 'time_commitment', 'why_select_you', 'problem_to_solve',
    'impact_meaning', 'commitment_understand', 'commitment_values',
];

$errors = [];
foreach ($required as $field) {
    if ($data[$field] === '') {
        $errors[] = $field;
    }
}
if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email_format';
}

if (!empty($errors)) {
    // In a production build, re-render register.php with these errors and
    // the submitted values pre-filled. Kept simple here.
    $_SESSION['form_errors'] = $errors;
    $_SESSION['form_data'] = $data;
    header('Location: register.php?error=1');
    exit;
}

// ---- Connect to the Database ----
$conn = get_db_connection();
$table_name = TABLE_PREFIX . 'ssc_unilag_waitlist_registrations';

// ---- Check if already applied ----
$escaped_email = $conn->real_escape_string($data['email']);
$check = $conn->query("SELECT id FROM `$table_name` WHERE email = '$escaped_email' LIMIT 1");
if ($check && $check->num_rows > 0) {
    $_SESSION['form_errors'] = ['email_exists'];
    $_SESSION['form_data'] = $data;
    header('Location: register.php?error=1');
    exit;
}

// ---- Build the record & escape fields ----
$id = bin2hex(random_bytes(8));
$submitted_at = date('Y-m-d H:i:s');
$status = 'pending';

$full_name = $conn->real_escape_string($data['full_name']);
$email = $conn->real_escape_string($data['email']);
$phone = $conn->real_escape_string($data['phone']);
$gender = $conn->real_escape_string($data['gender']);
$date_of_birth = $conn->real_escape_string($data['date_of_birth']);
$faculty = $conn->real_escape_string($data['faculty']);
$department = $conn->real_escape_string($data['department']);
$level = $conn->real_escape_string($data['level']);
$student_id = $conn->real_escape_string($data['student_id']);
$instagram_handle = $conn->real_escape_string($data['instagram_handle']);
$linkedin_profile = $conn->real_escape_string($data['linkedin_profile']);
$about_you = $conn->real_escape_string($data['about_you']);

$interests_str = $conn->real_escape_string(json_encode($data['interests']));
$skills_to_develop = $conn->real_escape_string($data['skills_to_develop']);
$existing_skills = $conn->real_escape_string($data['existing_skills']);
$activities_of_interest_str = $conn->real_escape_string(json_encode($data['activities_of_interest']));

$volunteer_interest = $conn->real_escape_string($data['volunteer_interest']);
$volunteer_team = $conn->real_escape_string($data['volunteer_team']);
$time_commitment = $conn->real_escape_string($data['time_commitment']);
$why_select_you = $conn->real_escape_string($data['why_select_you']);
$problem_to_solve = $conn->real_escape_string($data['problem_to_solve']);
$impact_meaning = $conn->real_escape_string($data['impact_meaning']);
$commitment_understand = $conn->real_escape_string($data['commitment_understand']);
$commitment_values = $conn->real_escape_string($data['commitment_values']);
$raw_payload = $conn->real_escape_string(json_encode($data));

// ---- Insert into the database ----
$sql_insert = "INSERT INTO `$table_name` (
    id, submitted_at, status, full_name, email, phone, gender, date_of_birth, faculty, department,
    level, student_id, instagram_handle, linkedin_profile, about_you, interests, skills_to_develop,
    existing_skills, activities_of_interest, volunteer_interest, volunteer_team, time_commitment,
    why_select_you, problem_to_solve, impact_meaning, commitment_understand, commitment_values, raw_payload
) VALUES (
    '$id', '$submitted_at', '$status', '$full_name', '$email', '$phone', '$gender', '$date_of_birth', '$faculty', '$department',
    '$level', '$student_id', '$instagram_handle', '$linkedin_profile', '$about_you', '$interests_str', '$skills_to_develop',
    '$existing_skills', '$activities_of_interest_str', '$volunteer_interest', '$volunteer_team', '$time_commitment',
    '$why_select_you', '$problem_to_solve', '$impact_meaning', '$commitment_understand', '$commitment_values', '$raw_payload'
)";

if (!$conn->query($sql_insert)) {
    http_response_code(500);
    echo 'Could not save your application right now. Database error: ' . htmlspecialchars($conn->error);
    exit;
}

$conn->close();

$first_name = explode(' ', $data['full_name'])[0];

// ---- Notify the admin team via Brevo ----
$admin_subject = 'New chapter application: ' . $data['full_name'];
$admin_body = "
    <html>
    <body style=\"font-family: sans-serif; line-height: 1.6; color: #333;\">
      <div style=\"max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;\">
        <h2 style=\"color: #6b21a8;\">New Membership Application</h2>
        <p>A new membership application has been submitted for the UNILAG Chapter.</p>
        <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">
        <p><strong>Name:</strong> {$data['full_name']}<br>
        <strong>Email:</strong> {$data['email']}<br>
        <strong>Phone:</strong> {$data['phone']}<br>
        <strong>Faculty / Department:</strong> {$data['faculty']} / {$data['department']}<br>
        <strong>Level:</strong> {$data['level']}<br>
        <strong>Why they should be selected:</strong> {$data['why_select_you']}</p>
        <p>Review the full application in the admin panel.</p>
      </div>
    </body>
    </html>
";
sendBrevoEmail(ADMIN_EMAIL, FROM_NAME . ' Admin', $admin_subject, $admin_body);

// ---- Send the applicant a receipt via Brevo ----
$applicant_subject = 'We received your application — Socially Speaking UNILAG Chapter';
$applicant_body = "
    <html>
    <body style=\"font-family: sans-serif; line-height: 1.6; color: #333;\">
      <div style=\"max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;\">
        <h2 style=\"color: #6b21a8;\">Hello {$first_name},</h2>
        <p>Thank you for applying to join the <strong>Socially Speaking UNILAG Chapter</strong>.</p>
        <p>Our team will review your application to ensure alignment with the values and vision of the chapter. Successful applicants will receive an acceptance email with further instructions and an invitation to join the chapter's private WhatsApp community.</p>
        <p>Please note that submitting an application does not guarantee automatic admission.</p>
        <p>We look forward to reviewing your application.</p>
        <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">
        <p><em>Be the standard. Be the difference.</em></p>
        <p><strong>Socially Speaking, UNILAG Chapter</strong></p>
      </div>
    </body>
    </html>
";
sendBrevoEmail($data['email'], $data['full_name'], $applicant_subject, $applicant_body);

// ---- Redirect to a clean thank-you page ----
$_SESSION['last_applicant_name'] = $first_name;
header('Location: thank-you.php');
exit;
