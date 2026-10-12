<?php
/**
 * Safe, idempotent database migration for SSC 2026
 * Referral, Mobilization & Attendance Tracking System
 * 
 * Can be run via browser or CLI without destroying data.
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

ob_start();

$is_cli = (php_sapi_name() === 'cli');
if (!$is_cli) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
}

$config_path = __DIR__ . '/db-config.php';
if (!file_exists($config_path)) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'db-config.php not found']);
    exit;
}
require_once $config_path;

mysqli_report(MYSQLI_REPORT_OFF);
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_errno) {
    $conn = @new mysqli('127.0.0.1', DB_USER, DB_PASSWORD, DB_NAME);
}
if ($conn->connect_errno) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}
$conn->set_charset('utf8mb4');

$table_prefix = defined('TABLE_PREFIX') ? TABLE_PREFIX : '';
$reg_table = $table_prefix . 'ssc2026_registrations';
$mob_table = $table_prefix . 'ssc2026_mobilizers';
$wa_table = 'ssc_whatsapp_groups';

$log = [];

// -----------------------------------------------------------------------------
// 1. Create Mobilizers Table if not exists
// -----------------------------------------------------------------------------
$sql_create_mobilizers = "CREATE TABLE IF NOT EXISTS `$mob_table` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL,
    `full_name` VARCHAR(200) NOT NULL,
    `email` VARCHAR(200) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `organization` VARCHAR(200) NOT NULL,
    `referral_code` VARCHAR(32) NOT NULL,
    `auth_token` VARCHAR(64) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'active',
    UNIQUE KEY `uniq_mobilizer_email` (`email`),
    UNIQUE KEY `uniq_mobilizer_ref_code` (`referral_code`),
    UNIQUE KEY `uniq_mobilizer_token` (`auth_token`),
    INDEX `idx_mobilizer_org` (`organization`),
    INDEX `idx_mobilizer_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql_create_mobilizers)) {
    $log[] = "Table `$mob_table` is verified/created.";
} else {
    $log[] = "Error creating `$mob_table`: " . $conn->error;
}

// -----------------------------------------------------------------------------
// 2. Add columns to registrations table safely
// -----------------------------------------------------------------------------
$columns_to_add = [
    'referral_code'   => "ALTER TABLE `$reg_table` ADD COLUMN `referral_code` VARCHAR(32) NULL",
    'referred_by_code'=> "ALTER TABLE `$reg_table` ADD COLUMN `referred_by_code` VARCHAR(32) NULL",
    'checked_in_at'   => "ALTER TABLE `$reg_table` ADD COLUMN `checked_in_at` DATETIME NULL",
    'checked_in_by'   => "ALTER TABLE `$reg_table` ADD COLUMN `checked_in_by` VARCHAR(100) NULL",
];

foreach ($columns_to_add as $col => $sql) {
    $chk = $conn->query("SHOW COLUMNS FROM `$reg_table` LIKE '$col'");
    if ($chk && $chk->num_rows === 0) {
        if ($conn->query($sql)) {
            $log[] = "Added column `$col` to `$reg_table`.";
        } else {
            $log[] = "Failed to add column `$col`: " . $conn->error;
        }
    } else {
        $log[] = "Column `$col` already exists in `$reg_table`.";
    }
}

// -----------------------------------------------------------------------------
// 3. Add Indexes safely
// -----------------------------------------------------------------------------
$indexes_to_add = [
    'idx_reg_referral_code'   => "ALTER TABLE `$reg_table` ADD INDEX `idx_reg_referral_code` (`referral_code`)",
    'idx_reg_referred_by_code'=> "ALTER TABLE `$reg_table` ADD INDEX `idx_reg_referred_by_code` (`referred_by_code`)",
    'idx_reg_checked_in_at'   => "ALTER TABLE `$reg_table` ADD INDEX `idx_reg_checked_in_at` (`checked_in_at`)",
];

foreach ($indexes_to_add as $idx_name => $sql) {
    $chk = $conn->query("SHOW INDEX FROM `$reg_table` WHERE Key_name = '$idx_name'");
    if ($chk && $chk->num_rows === 0) {
        if ($conn->query($sql)) {
            $log[] = "Added index `$idx_name` to `$reg_table`.";
        } else {
            $log[] = "Notice: could not add index `$idx_name`: " . $conn->error;
        }
    } else {
        $log[] = "Index `$idx_name` already exists on `$reg_table`.";
    }
}

// -----------------------------------------------------------------------------
// 4. Update WhatsApp group 1 link
// -----------------------------------------------------------------------------
$wa_chk = $conn->query("SHOW TABLES LIKE '$wa_table'");
if ($wa_chk && $wa_chk->num_rows > 0) {
    $wa_update = "UPDATE `$wa_table` SET `link` = 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4' WHERE `id` = 1";
    if ($conn->query($wa_update)) {
        $log[] = "Updated WhatsApp Group 1 link in `$wa_table`.";
    }
}

// -----------------------------------------------------------------------------
// 5. Create / Update Blog Posts Table
// -----------------------------------------------------------------------------
$blog_table = 'ssc_blog_posts';
$sql_create_blog = "CREATE TABLE IF NOT EXISTS `$blog_table` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `author` VARCHAR(100) NOT NULL DEFAULT 'Socially Speaking',
    `category` VARCHAR(100) NOT NULL DEFAULT 'General',
    `tags` VARCHAR(255) NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` TEXT NULL,
    `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `status` VARCHAR(50) DEFAULT 'published',
    UNIQUE KEY `uniq_blog_slug` (`slug`),
    INDEX `idx_blog_status` (`status`),
    INDEX `idx_blog_category` (`category`),
    INDEX `idx_blog_published` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql_create_blog)) {
    $log[] = "Table `$blog_table` is verified/created.";
} else {
    $log[] = "Error creating `$blog_table`: " . $conn->error;
}

$blog_cols_to_add = [
    'author'          => "ALTER TABLE `$blog_table` ADD COLUMN `author` VARCHAR(100) NOT NULL DEFAULT 'Socially Speaking'",
    'category'        => "ALTER TABLE `$blog_table` ADD COLUMN `category` VARCHAR(100) NOT NULL DEFAULT 'General'",
    'tags'            => "ALTER TABLE `$blog_table` ADD COLUMN `tags` VARCHAR(255) NULL",
    'seo_title'       => "ALTER TABLE `$blog_table` ADD COLUMN `seo_title` VARCHAR(255) NULL",
    'seo_description' => "ALTER TABLE `$blog_table` ADD COLUMN `seo_description` TEXT NULL",
    'status'          => "ALTER TABLE `$blog_table` ADD COLUMN `status` VARCHAR(50) DEFAULT 'published'",
];

foreach ($blog_cols_to_add as $col => $sql) {
    $chk = $conn->query("SHOW COLUMNS FROM `$blog_table` LIKE '$col'");
    if ($chk && $chk->num_rows === 0) {
        if ($conn->query($sql)) {
            $log[] = "Added column `$col` to `$blog_table`.";
        } else {
            $log[] = "Failed to add column `$col` to `$blog_table`: " . $conn->error;
        }
    }
}

// -----------------------------------------------------------------------------
// 6. Backfill existing registrations with unique referral codes
// -----------------------------------------------------------------------------
$backfilled_count = 0;
$empty_refs = $conn->query("SELECT `id` FROM `$reg_table` WHERE `referral_code` IS NULL OR `referral_code` = ''");
if ($empty_refs && $empty_refs->num_rows > 0) {
    $update_stmt = $conn->prepare("UPDATE `$reg_table` SET `referral_code` = ? WHERE `id` = ?");
    while ($row = $empty_refs->fetch_assoc()) {
        $target_id = $row['id'];
        $unique_found = false;
        $new_code = '';
        while (!$unique_found) {
            $new_code = 'REF' . strtoupper(bin2hex(random_bytes(3)));
            $test_dup = $conn->query("SELECT 1 FROM `$reg_table` WHERE `referral_code` = '$new_code' UNION SELECT 1 FROM `$mob_table` WHERE `referral_code` = '$new_code' LIMIT 1");
            if (!$test_dup || $test_dup->num_rows === 0) {
                $unique_found = true;
            }
        }
        $update_stmt->bind_param('ss', $new_code, $target_id);
        $update_stmt->execute();
        $backfilled_count++;
    }
    $update_stmt->close();
    $log[] = "Backfilled referral codes for $backfilled_count existing attendees.";
} else {
    $log[] = "No existing attendees required referral code backfill.";
}

$conn->close();

ob_end_clean();
echo json_encode([
    'ok' => true,
    'message' => 'Migration executed successfully without data loss.',
    'backfilled_attendees' => $backfilled_count,
    'log' => $log,
]);
