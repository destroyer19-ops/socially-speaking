ALTER TABLE ssc_2026_registrations CHANGE COLUMN city_state state_country VARCHAR(100) NOT NULL;

-- Blog system table
CREATE TABLE IF NOT EXISTS `ssc_blog_posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(50) DEFAULT 'published',
    UNIQUE KEY slug (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Seat allocation table
CREATE TABLE IF NOT EXISTS `ssc2026_seats` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `section` VARCHAR(10) NOT NULL,
    `seat_number` INT NOT NULL,
    `is_assigned` TINYINT(1) NOT NULL DEFAULT 0,
    `registration_id` VARCHAR(24) NULL,
    UNIQUE KEY `section_seat` (`section`, `seat_number`),
    INDEX `is_assigned_idx` (`is_assigned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add seat_allocation to registrations
ALTER TABLE ssc_2026_registrations ADD COLUMN seat_allocation VARCHAR(50) NULL;

-- Update the first WhatsApp group link
UPDATE ssc_whatsapp_groups SET link = 'https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4' WHERE id = 1;
