-- =====================================================
-- CLEANUP DATABASE (PRESERVE USERS)
-- Safely empty all tables except user-related tables
-- =====================================================

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TRUNCATE TRANSACTIONAL TABLES
-- =====================================================

-- Orders and related
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;

-- Payments
TRUNCATE TABLE payments;

-- Quotations
TRUNCATE TABLE quote_items;
TRUNCATE TABLE quotations;

-- Products and inventory
TRUNCATE TABLE product_analytics;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE products;

-- Reviews
TRUNCATE TABLE reviews;

-- Returns
TRUNCATE TABLE returns;

-- Notifications
TRUNCATE TABLE notifications;

-- =====================================================
-- TRUNCATE CONTENT TABLES
-- =====================================================

-- Banners
TRUNCATE TABLE hero_slides;
TRUNCATE TABLE category_banners;

-- Categories (will repopulate)
TRUNCATE TABLE categories;

-- FAQs (if exists)
-- TRUNCATE TABLE faqs;

-- =====================================================
-- TRUNCATE ANALYTICS TABLES
-- =====================================================

TRUNCATE TABLE dashboard_metrics;
TRUNCATE TABLE admin_activity_log;

-- =====================================================
-- CLEAN SESSION/AUTH TABLES (OPTIONAL - KEEPS USERS LOGGED IN)
-- =====================================================

-- Uncomment these if you want to clear sessions too
-- TRUNCATE TABLE session_tokens;
-- TRUNCATE TABLE refresh_tokens;
-- TRUNCATE TABLE verification_tokens;
-- TRUNCATE TABLE password_reset_tokens;

-- =====================================================
-- KEEP THESE TABLES (USER DATA)
-- =====================================================

-- users (PRESERVED)
-- user_profiles (PRESERVED)
-- login_attempts (PRESERVED - for security)
-- signup_attempts (PRESERVED - for security)
-- rate_limit_logs (PRESERVED - for security)

-- =====================================================
-- RESET AUTO_INCREMENT VALUES
-- =====================================================

ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE stock_movements AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE hero_slides AUTO_INCREMENT = 1;
ALTER TABLE category_banners AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check remaining data
SELECT 'Users Count' as Info, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Products Count', COUNT(*) FROM products
UNION ALL
SELECT 'Orders Count', COUNT(*) FROM orders
UNION ALL
SELECT 'Categories Count', COUNT(*) FROM categories;

-- Show success message
SELECT 'Database cleaned successfully! Users preserved.' as Status;
