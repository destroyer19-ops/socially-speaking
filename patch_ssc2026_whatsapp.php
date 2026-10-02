<?php
$file = 'public/process-ssc2026.php';
$content = file_get_contents($file);

// Replace the duplicate logic and insert logic
$old_duplicate = <<<PHP
// ── Duplicate-email guard ─────────────────────────────────────────────────────
\$escaped_email = \$conn->real_escape_string(\$email);
\$escaped_phone = \$conn->real_escape_string(\$phone);
\$dup = \$conn->query("SELECT id FROM `\$table` WHERE email = '\$escaped_email' OR phone = '\$escaped_phone' LIMIT 1");
if (\$dup && \$dup->num_rows > 0) {
    \$conn->close();
    ob_end_clean();
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'This email address or phone number is already registered for SSC 2026']);
    exit;
}
PHP;

$new_duplicate = <<<PHP
\$conn->query("CREATE TABLE IF NOT EXISTS `ssc_whatsapp_groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    capacity INT NOT NULL DEFAULT 1000,
    assigned INT NOT NULL DEFAULT 0,
    link VARCHAR(500) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

\$res_col = \$conn->query("SHOW COLUMNS FROM `\$table` LIKE 'whatsapp_group_id'");
if (\$res_col->num_rows === 0) {
    \$conn->query("ALTER TABLE `\$table` ADD COLUMN whatsapp_group_id INT NULL");
}

// ── Duplicate-email guard ─────────────────────────────────────────────────────
\$escaped_email = \$conn->real_escape_string(\$email);
\$escaped_phone = \$conn->real_escape_string(\$phone);
\$dup = \$conn->query("SELECT id, whatsapp_group_id FROM `\$table` WHERE email = '\$escaped_email' OR phone = '\$escaped_phone' LIMIT 1");
if (\$dup && \$dup->num_rows > 0) {
    \$row = \$dup->fetch_assoc();
    \$group_link = null;
    if (!empty(\$row['whatsapp_group_id'])) {
        \$gid = (int)\$row['whatsapp_group_id'];
        \$gRes = \$conn->query("SELECT link FROM `ssc_whatsapp_groups` WHERE id = \$gid LIMIT 1");
        if (\$gRes && \$gRes->num_rows > 0) {
            \$gRow = \$gRes->fetch_assoc();
            \$group_link = \$gRow['link'];
        }
    }
    
    \$conn->close();
    ob_end_clean();
    // Return 200 so the frontend can show the success CTA rather than a generic error.
    http_response_code(200);
    echo json_encode([
        'ok' => true, 
        'isDuplicate' => true, 
        'whatsapp_group_link' => \$group_link,
        'message' => 'This email address or phone number is already registered for SSC 2026.'
    ]);
    exit;
}

// ── WhatsApp Group Allocation (Transaction) ──────────────────────────────────
\$conn->begin_transaction();

\$group_id = null;
\$group_link = null;
// SELECT ... FOR UPDATE locks the rows until we commit, preventing concurrent overbooking
\$groupRes = \$conn->query("SELECT id, link FROM ssc_whatsapp_groups WHERE active = 1 AND assigned < capacity ORDER BY sort_order ASC, id ASC LIMIT 1 FOR UPDATE");
if (\$groupRes && \$groupRes->num_rows > 0) {
    \$group = \$groupRes->fetch_assoc();
    \$group_id = \$group['id'];
    \$group_link = \$group['link'];
}
PHP;

$content = str_replace($old_duplicate, $new_duplicate, $content);


$old_insert = <<<PHP
\$stmt = \$conn->prepare("INSERT INTO `\$table`
    (id, created_at, status, full_name, email, phone, whatsapp, age_range, gender,
     state_country, school_org, occupation, how_heard, attended_before,
     editions_attended, hoping_to_gain, qr_code_url, raw_payload)
VALUES
    (?, NOW(), 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!\$stmt) {
    \$conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to prepare statement: ' . \$conn->error]);
    exit;
}

// We have 17 bind parameters:
// id(s), full_name(s), email(s), phone(s), whatsapp(s), age_range(s), gender(s),
// state_country(s), school_org(s), occupation(s), how_heard(s), attended_before(s),
// editions_attended(s), hoping_to_gain(s), qr_code_url(s), raw_payload(s)
// => 1s + 15s + 1s = 17 s's ... wait.
// id(1), full_name(2), email(3), phone(4), whatsapp(5), age_range(6), gender(7),
// state_country(8), school_org(9), occupation(10), how_heard(11), attended_before(12),
// editions_attended(13), hoping_to_gain(14), qr_code_url(15), raw_payload(16)
// Wait, 16 bound parameters here!
\$stmt->bind_param(
    "ssssssssssssssss",
    \$reg_id, \$full_name, \$email, \$phone, \$whatsapp, \$age_range, \$gender,
    \$state_country, \$school_org, \$occupation, \$how_heard, \$attended_before,
    \$editions_attended_str, \$hoping_to_gain, \$qr_code_url, \$raw_payload
);

if (!\$stmt->execute()) {
    \$conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save registration: ' . \$stmt->error]);
    exit;
}
PHP;

$new_insert = <<<PHP
\$stmt = \$conn->prepare("INSERT INTO `\$table`
    (id, created_at, status, full_name, email, phone, whatsapp, age_range, gender,
     state_country, school_org, occupation, how_heard, attended_before,
     editions_attended, hoping_to_gain, qr_code_url, raw_payload, whatsapp_group_id)
VALUES
    (?, NOW(), 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!\$stmt) {
    \$conn->rollback();
    \$conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to prepare statement: ' . \$conn->error]);
    exit;
}

\$stmt->bind_param(
    "ssssssssssssssssi",
    \$reg_id, \$full_name, \$email, \$phone, \$whatsapp, \$age_range, \$gender,
    \$state_country, \$school_org, \$occupation, \$how_heard, \$attended_before,
    \$editions_attended_str, \$hoping_to_gain, \$qr_code_url, \$raw_payload, \$group_id
);

if (!\$stmt->execute()) {
    \$conn->rollback();
    \$conn->close();
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save registration: ' . \$stmt->error]);
    exit;
}

if (\$group_id) {
    \$conn->query("UPDATE ssc_whatsapp_groups SET assigned = assigned + 1 WHERE id = \$group_id");
}
\$conn->commit();
PHP;

$content = str_replace($old_insert, $new_insert, $content);

// Final success response replacement
$old_success = <<<PHP
// ── Return success ────────────────────────────────────────────────────────────
ob_end_clean();
echo json_encode([
    'ok' => true,
    'id' => \$reg_id
]);
PHP;

$new_success = <<<PHP
// ── Return success ────────────────────────────────────────────────────────────
ob_end_clean();
echo json_encode([
    'ok' => true,
    'id' => \$reg_id,
    'whatsapp_group_link' => \$group_link
]);
PHP;

$content = str_replace($old_success, $new_success, $content);

file_put_contents('public/process-ssc2026.php', $content);

echo "Patched process-ssc2026.php";
