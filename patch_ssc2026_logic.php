<?php
/**
 * Update script for process-ssc2026.php
 */

$file = __DIR__ . '/public/process-ssc2026.php';
$content = file_get_contents($file);

// 1. Add seating table creation
$seat_table_sql = '
$conn->query("CREATE TABLE IF NOT EXISTS `ssc2026_seats` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    is_assigned TINYINT(1) NOT NULL DEFAULT 0,
    registration_id VARCHAR(24) NULL,
    UNIQUE KEY section_seat (section, seat_number),
    INDEX is_assigned_idx (is_assigned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$seat_count_res = $conn->query("SELECT COUNT(*) AS cnt FROM `ssc2026_seats`");
if ($seat_count_res) {
    $row = $seat_count_res->fetch_assoc();
    if ($row && $row[\'cnt\'] == 0) {
        $conn->begin_transaction();
        $sections = [
            \'A1\' => 77, \'A2\' => 62, \'B1\' => 206, \'B2\' => 172, \'C1\' => 220, \'C2\' => 468, \'D1\' => 172, \'D2\' => 210, \'E1\' => 78, \'E2\' => 62,
            \'V1\' => 31, \'V2\' => 29, \'V3\' => 10, \'V4\' => 28, \'V5\' => 28, \'V6\' => 26, \'V7\' => 33, \'V8\' => 34,
            \'U1\' => 11, \'U2\' => 53, \'U3\' => 155, \'U4\' => 306, \'U5\' => 212, \'U6\' => 206, \'U7\' => 299, \'U8\' => 155, \'U9\' => 53, \'U10\' => 11,
            \'U11\' => 9, \'U12\' => 9, \'U13\' => 9, \'U14\' => 9
        ];
        $ins = $conn->prepare("INSERT INTO `ssc2026_seats` (section, seat_number) VALUES (?, ?)");
        if ($ins) {
            foreach ($sections as $sec => $capacity) {
                for ($i = 1; $i <= $capacity; $i++) {
                    $ins->bind_param(\'si\', $sec, $i);
                    $ins->execute();
                }
            }
            $ins->close();
        }
        $conn->commit();
    }
}
';
$content = str_replace(
    '// ── Ensure all required columns exist (safe for pre-existing tables) ──────────',
    $seat_table_sql . "\n// ── Ensure all required columns exist (safe for pre-existing tables) ──────────",
    $content
);

// Add seat_allocation to columns_needed
$content = str_replace(
    "'whatsapp_group_id'  => \"ALTER TABLE `\$table` ADD COLUMN whatsapp_group_id INT NULL\",",
    "'whatsapp_group_id'  => \"ALTER TABLE `\$table` ADD COLUMN whatsapp_group_id INT NULL\",\n    'seat_allocation'    => \"ALTER TABLE `\$table` ADD COLUMN seat_allocation VARCHAR(50) NULL\",",
    $content
);

// Add WhatsApp group link update
$wa_update = '
// Update WhatsApp group 1 link as requested
$conn->query("UPDATE ssc_whatsapp_groups SET link = \'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4\' WHERE id = 1");
';
$content = str_replace(
    '// ── Duplicate-email guard ─────────────────────────────────────────────────────',
    $wa_update . "\n// ── Duplicate-email guard ─────────────────────────────────────────────────────",
    $content
);

// Add Seat allocation logic
$seat_logic = '
$seat_allocation = null;
$seat_id = null;
$seatRes = $conn->query("SELECT id, section, seat_number FROM ssc2026_seats WHERE is_assigned = 0 ORDER BY id ASC LIMIT 1 FOR UPDATE");
if ($seatRes && $seatRes->num_rows > 0) {
    $seat = $seatRes->fetch_assoc();
    $seat_id = $seat[\'id\'];
    $seat_allocation = $seat[\'section\'] . \'-\' . $seat[\'seat_number\'];
}
';
$content = str_replace(
    '// ── Generate unique registration ID ──────────────────────────────────────────',
    $seat_logic . "\n// ── Generate unique registration ID ──────────────────────────────────────────",
    $content
);

// Update insert statement
$content = str_replace(
    'qr_code_url, raw_payload, whatsapp_group_id)',
    'qr_code_url, raw_payload, whatsapp_group_id, seat_allocation)',
    $content
);
$content = str_replace(
    '(?, NOW(), \'Pending\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");',
    '(?, NOW(), \'Pending\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");',
    $content
);

$content = str_replace(
    '$editions_attended, $hoping_to_gain, $qr_code_url, $raw_payload,
    $group_id_str
);',
    '$editions_attended, $hoping_to_gain, $qr_code_url, $raw_payload,
    $group_id_str, $seat_allocation
);',
    $content
);
$content = str_replace(
    '\'sssssssssssssssss\',',
    '\'ssssssssssssssssss\',',
    $content
);

// Add QR code payload update with seat
$content = str_replace(
    '$qr_data      = urlencode($reg_id);',
    '$qr_data      = urlencode($reg_id . ($seat_allocation ? "|" . $seat_allocation : ""));',
    $content
);

// Mark seat as assigned
$seat_update_logic = '
if ($seat_id) {
    $conn->query("UPDATE ssc2026_seats SET is_assigned = 1, registration_id = \'$reg_id\' WHERE id = $seat_id");
}
';
$content = str_replace(
    '// ── Increment assigned counter atomically ────────────────────────────────────',
    $seat_update_logic . "\n// ── Increment assigned counter atomically ────────────────────────────────────",
    $content
);

// Add seat to email
$seat_email_row = '<tr><td style="padding:6px 0;font-size:13px;color:#737373;">Seat Allocation</td><td style="padding:6px 0;font-size:13px;color:#e5e5e5;font-weight:600;">" . ($seat_allocation ? htmlspecialchars($seat_allocation) : "Unassigned") . "</td></tr>';
$content = str_replace(
    '<tr><td style="padding:6px 0;font-size:13px;color:#737373;">Status</td>',
    $seat_email_row . "\n                      <tr><td style=\"padding:6px 0;font-size:13px;color:#737373;\">Status</td>",
    $content
);

// Add seat allocation to output response
$content = str_replace(
    '\'qr_code_url\'         => $qr_code_url,',
    '\'qr_code_url\'         => $qr_code_url,
    \'seat_allocation\'     => $seat_allocation,',
    $content
);

// Remove default whatsapp group 1 link from defaults array to avoid confusion though it is just seeding
$content = str_replace(
    '\'https://chat.whatsapp.com/HuuOUNSbSnyG6Fbz32DeYJ\'',
    '\'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4\'',
    $content
);

file_put_contents($file, $content);
echo "Done\n";
