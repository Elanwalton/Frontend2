-- ============================================================
-- SUNLEAF TECHNOLOGIES - FULL DATABASE SETUP
-- Production-ready SQL for MariaDB 10.4+ / MySQL 8.0+
-- ============================================================

-- Create database and use it
CREATE DATABASE IF NOT EXISTS `sunleaftechnologies`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `sunleaftechnologies`;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `second_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `short_description` TEXT NULL,
  `category` VARCHAR(100) NULL,
  `status` VARCHAR(50) NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(10,2) NULL,
  `discount_percentage` DECIMAL(5,2) NULL,
  `revenue` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 0,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `main_image_url` VARCHAR(500) NULL,
  `thumbnail_urls` LONGTEXT NULL,
  `specifications` LONGTEXT NULL,
  `features` LONGTEXT NULL,
  `images` LONGTEXT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `review_count` INT NOT NULL DEFAULT 0,
  `view_count` INT NOT NULL DEFAULT 0,
  `sales_count` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `featured_priority` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_rating` (`rating`),
  KEY `idx_product_stock` (`stock_quantity`),
  KEY `idx_product_category` (`category`),
  KEY `idx_product_featured` (`is_featured`, `featured_priority`),
  KEY `idx_product_price` (`price`),
  CHECK (`thumbnail_urls` IS NULL OR JSON_VALID(`thumbnail_urls`)),
  CHECK (`specifications` IS NULL OR JSON_VALID(`specifications`)),
  CHECK (`features` IS NULL OR JSON_VALID(`features`)),
  CHECK (`images` IS NULL OR JSON_VALID(`images`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: product_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `review_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `comment` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `idx_reviews_product` (`product_id`),
  CONSTRAINT `fk_reviews_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: product_analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS `product_analytics` (
  `product_id` INT UNSIGNED NOT NULL,
  `event_type` ENUM('view','add_to_cart','purchase','wishlist') NOT NULL,
  `event_date` DATE NOT NULL,
  `event_count` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`product_id`, `event_type`, `event_date`),
  CONSTRAINT `fk_analytics_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: quotations
-- ============================================================
CREATE TABLE IF NOT EXISTS `quotations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quote_id` INT UNSIGNED NULL,
  `quote_number` VARCHAR(100) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(190) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quotations_quote_id` (`quote_id`),
  KEY `idx_quotations_quote_number` (`quote_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRIGGER: Auto-sync quote_id with id
-- ============================================================
DELIMITER $$
CREATE TRIGGER `trg_quotations_set_quote_id`
AFTER INSERT ON `quotations`
FOR EACH ROW
BEGIN
  UPDATE `quotations` SET `quote_id` = NEW.`id` WHERE `id` = NEW.`id`;
END$$
DELIMITER ;

-- ============================================================
-- TABLE: quote_items
-- ============================================================
CREATE TABLE IF NOT EXISTS `quote_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quote_id` INT UNSIGNED NOT NULL,
  `item_name` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quote_items_quote_id` (`quote_id`),
  CONSTRAINT `fk_quote_items_quote`
    FOREIGN KEY (`quote_id`) REFERENCES `quotations`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATA NORMALIZATION: Set safe defaults for existing products
-- ============================================================
UPDATE `products`
SET
  `rating` = IFNULL(`rating`, 0.00),
  `review_count` = IFNULL(`review_count`, 0),
  `specifications` = CASE 
    WHEN `specifications` IS NULL OR NOT JSON_VALID(`specifications`) 
    THEN JSON_OBJECT() 
    ELSE `specifications` 
  END,
  `features` = CASE 
    WHEN `features` IS NULL OR NOT JSON_VALID(`features`) 
    THEN JSON_ARRAY() 
    ELSE `features` 
  END,
  `images` = CASE
    WHEN `images` IS NULL OR NOT JSON_VALID(`images`)
    THEN JSON_ARRAY(IFNULL(`main_image_url`, ''))
    ELSE `images`
  END,
  `short_description` = CASE
    WHEN (`short_description` IS NULL OR `short_description` = '') AND `description` IS NOT NULL
    THEN SUBSTRING(`description`, 1, 150)
    ELSE `short_description`
  END
WHERE 1;

-- ============================================================
-- VERIFICATION QUERIES (optional - comment out if not needed)
-- ============================================================
SELECT 'Database setup complete!' AS Status;
SELECT COUNT(*) AS total_products FROM `products`;
SELECT COUNT(*) AS total_users FROM `users`;
SELECT COUNT(*) AS total_quotations FROM `quotations`;
