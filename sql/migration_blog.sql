-- =====================================================================
-- SSC2026 Blog CMS Migration Script
-- Idempotent script to enhance ssc_blog_posts table with rich metadata,
-- authoring, status, categories, SEO, and timestamps.
-- =====================================================================

CREATE TABLE IF NOT EXISTS `ssc_blog_posts` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Safely add missing columns if table already existed with older schema
SET @dbname = DATABASE();
SET @tablename = 'ssc_blog_posts';

-- author
SET @query = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'author') = 0,
    'ALTER TABLE `ssc_blog_posts` ADD COLUMN `author` VARCHAR(100) NOT NULL DEFAULT \'Socially Speaking\' AFTER `image_url`',
    'SELECT 1'
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- category
SET @query = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'category') = 0,
    'ALTER TABLE `ssc_blog_posts` ADD COLUMN `category` VARCHAR(100) NOT NULL DEFAULT \'General\' AFTER `author`',
    'SELECT 1'
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tags
SET @query = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'tags') = 0,
    'ALTER TABLE `ssc_blog_posts` ADD COLUMN `tags` VARCHAR(255) NULL AFTER `category`',
    'SELECT 1'
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- seo_title
SET @query = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'seo_title') = 0,
    'ALTER TABLE `ssc_blog_posts` ADD COLUMN `seo_title` VARCHAR(255) NULL AFTER `tags`',
    'SELECT 1'
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- seo_description
SET @query = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'seo_description') = 0,
    'ALTER TABLE `ssc_blog_posts` ADD COLUMN `seo_description` TEXT NULL AFTER `seo_title`',
    'SELECT 1'
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- updated_at
SET @query = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE `ssc_blog_posts` ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `published_at`',
    'SELECT 1'
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
