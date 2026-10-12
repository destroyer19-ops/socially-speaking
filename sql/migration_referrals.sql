-- ==============================================================================
-- SSC 2026: Referral, Mobilization & Attendance Tracking System Migration
-- Safe & Idempotent SQL script for MySQL / MariaDB
-- ==============================================================================

-- 1. Create Mobilizers Table
CREATE TABLE IF NOT EXISTS `ssc2026_mobilizers` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add Referral & Check-in Columns to Conference Registrations
-- If your table uses TABLE_PREFIX, adjust ssc2026_registrations accordingly (e.g. wp_ssc2026_registrations)
ALTER TABLE `ssc2026_registrations`
    ADD COLUMN IF NOT EXISTS `referral_code` VARCHAR(32) NULL,
    ADD COLUMN IF NOT EXISTS `referred_by_code` VARCHAR(32) NULL,
    ADD COLUMN IF NOT EXISTS `checked_in_at` DATETIME NULL,
    ADD COLUMN IF NOT EXISTS `checked_in_by` VARCHAR(100) NULL;

-- 3. Add Indexes on Referral and Attendance columns
-- Note: Check if key exists before running in MySQL versions < 8.0.13, or run via migrate-referrals.php
-- CREATE INDEX `idx_reg_referral_code` ON `ssc2026_registrations` (`referral_code`);
-- CREATE INDEX `idx_reg_referred_by_code` ON `ssc2026_registrations` (`referred_by_code`);
-- CREATE INDEX `idx_reg_checked_in_at` ON `ssc2026_registrations` (`checked_in_at`);

-- 4. Update the first WhatsApp Group Link
UPDATE `ssc_whatsapp_groups`
SET `link` = 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4'
WHERE `id` = 1;
