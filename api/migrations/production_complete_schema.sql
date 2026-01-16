-- ============================================================
-- SUNLEAF TECHNOLOGIES - COMPLETE PRODUCTION DATABASE SCHEMA
-- Version: 2.0
-- Date: November 2025
-- Description: Complete schema for admin dashboard with all features
-- ============================================================

USE `sunleaftechnologies`;

-- ============================================================
-- TABLE: orders
-- Stores all customer orders with comprehensive tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(190) NOT NULL,
  `customer_phone` VARCHAR(50) NULL,
  `shipping_address` TEXT NULL,
  `billing_address` TEXT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `tracking_number` VARCHAR(100) NULL,
  `carrier` VARCHAR(100) NULL,
  `shipped_at` TIMESTAMP NULL,
  `delivered_at` TIMESTAMP NULL,
  `estimated_delivery` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_created` (`created_at`),
  KEY `idx_orders_email` (`customer_email`),
  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: order_items
-- Individual items within each order
-- ============================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_sku` VARCHAR(100) NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: returns
-- Product returns and refund requests
-- ============================================================
CREATE TABLE IF NOT EXISTS `returns` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `return_number` VARCHAR(50) NOT NULL,
  `order_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `reason` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `refund_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'approved', 'rejected', 'processing', 'completed') NOT NULL DEFAULT 'pending',
  `refund_status` ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `refund_method` VARCHAR(50) NULL,
  `approved_by` INT UNSIGNED NULL,
  `approved_at` TIMESTAMP NULL,
  `processed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_return_number` (`return_number`),
  KEY `idx_returns_order` (`order_id`),
  KEY `idx_returns_user` (`user_id`),
  KEY `idx_returns_status` (`status`),
  CONSTRAINT `fk_returns_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_returns_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: payments
-- Payment transactions tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_id` VARCHAR(100) NOT NULL,
  `order_id` INT UNSIGNED NULL,
  `user_id` INT UNSIGNED NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `payment_method` ENUM('Mpesa', 'PayPal', 'Card', 'Bank Transfer', 'Cash on Delivery') NOT NULL,
  `status` ENUM('pending', 'processing', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `gateway_response` TEXT NULL,
  `customer_email` VARCHAR(190) NULL,
  `customer_name` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `processed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transaction_id` (`transaction_id`),
  KEY `idx_payments_order` (`order_id`),
  KEY `idx_payments_user` (`user_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_method` (`payment_method`),
  KEY `idx_payments_created` (`created_at`),
  CONSTRAINT `fk_payments_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: reviews (Enhanced from product_reviews)
-- Product reviews with admin moderation
-- ============================================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `order_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(190) NULL,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `title` VARCHAR(255) NULL,
  `comment` TEXT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `verified_purchase` TINYINT(1) NOT NULL DEFAULT 0,
  `helpful_count` INT NOT NULL DEFAULT 0,
  `admin_response` TEXT NULL,
  `responded_by` INT UNSIGNED NULL,
  `responded_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `idx_reviews_order` (`order_id`),
  KEY `idx_reviews_status` (`status`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `fk_reviews_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: quote_requests (Enhanced from quotations)
-- Customer quote requests with full tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS `quote_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quote_number` VARCHAR(100) NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(190) NOT NULL,
  `customer_phone` VARCHAR(50) NULL,
  `company_name` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `estimated_value` DECIMAL(10,2) NULL,
  `status` ENUM('pending', 'processing', 'sent', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
  `valid_until` DATE NULL,
  `file_path` VARCHAR(500) NULL,
  `notes` TEXT NULL,
  `assigned_to` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quote_number` (`quote_number`),
  KEY `idx_quote_requests_user` (`user_id`),
  KEY `idx_quote_requests_status` (`status`),
  KEY `idx_quote_requests_created` (`created_at`),
  CONSTRAINT `fk_quote_requests_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: site_settings
-- Store configuration and settings
-- ============================================================
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NULL,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `description` VARCHAR(255) NULL,
  `updated_by` INT UNSIGNED NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_setting_key` (`setting_key`),
  KEY `idx_settings_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: admin_activity_log
-- Track all admin actions for audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_activity_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` INT UNSIGNED NULL,
  `description` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_user` (`user_id`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_entity` (`entity_type`, `entity_id`),
  KEY `idx_activity_created` (`created_at`),
  CONSTRAINT `fk_activity_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notifications
-- System notifications for admins and users
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `link` VARCHAR(500) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`is_read`),
  KEY `idx_notifications_created` (`created_at`),
  CONSTRAINT `fk_notifications_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: dashboard_metrics
-- Pre-calculated metrics for dashboard performance
-- ============================================================
CREATE TABLE IF NOT EXISTS `dashboard_metrics` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `metric_date` DATE NOT NULL,
  `total_revenue` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `total_orders` INT NOT NULL DEFAULT 0,
  `completed_orders` INT NOT NULL DEFAULT 0,
  `pending_orders` INT NOT NULL DEFAULT 0,
  `shipped_orders` INT NOT NULL DEFAULT 0,
  `cancelled_orders` INT NOT NULL DEFAULT 0,
  `new_customers` INT NOT NULL DEFAULT 0,
  `total_products_sold` INT NOT NULL DEFAULT 0,
  `avg_order_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `conversion_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `cart_abandonment_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_metric_date` (`metric_date`),
  KEY `idx_metrics_date` (`metric_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_profiles
-- Extended user profile information
-- ============================================================
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `user_id` INT UNSIGNED NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `bio` TEXT NULL,
  `company` VARCHAR(255) NULL,
  `address_line1` VARCHAR(255) NULL,
  `address_line2` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(100) NULL,
  `timezone` VARCHAR(50) NULL,
  `language` VARCHAR(10) NULL DEFAULT 'en',
  `notification_preferences` JSON NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_profiles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`) VALUES
('store_name', 'Sunleaf Technologies', 'string', 'general', 'Store name'),
('store_email', 'admin@sunleaf.com', 'string', 'general', 'Store contact email'),
('store_phone', '+1 (555) 123-4567', 'string', 'general', 'Store contact phone'),
('store_address', '123 Solar Street, Green City, EC 12345', 'string', 'general', 'Store physical address'),
('currency', 'USD', 'string', 'general', 'Default currency'),
('timezone', 'America/New_York', 'string', 'general', 'Store timezone'),
('email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications'),
('order_notifications', 'true', 'boolean', 'notifications', 'Notify on new orders'),
('low_stock_alerts', 'true', 'boolean', 'notifications', 'Alert on low stock'),
('low_stock_threshold', '10', 'number', 'notifications', 'Low stock threshold'),
('review_notifications', 'true', 'boolean', 'notifications', 'Notify on new reviews'),
('two_factor_auth', 'false', 'boolean', 'security', 'Enable 2FA'),
('session_timeout', '30', 'number', 'security', 'Session timeout in minutes'),
('smtp_host', 'smtp.example.com', 'string', 'email', 'SMTP host'),
('smtp_port', '587', 'number', 'email', 'SMTP port'),
('smtp_user', 'noreply@sunleaf.com', 'string', 'email', 'SMTP username'),
('smtp_encryption', 'tls', 'string', 'email', 'SMTP encryption'),
('stripe_enabled', 'true', 'boolean', 'payment', 'Enable Stripe'),
('paypal_enabled', 'true', 'boolean', 'payment', 'Enable PayPal'),
('cod_enabled', 'false', 'boolean', 'payment', 'Enable Cash on Delivery')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================
-- Additional composite indexes for common queries
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_payments_status_created ON payments(status, created_at);
CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Production database schema created successfully!' AS Status;

-- Show all tables in current database
SHOW TABLES;
