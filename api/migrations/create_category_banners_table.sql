-- Create category_banners table for dynamic category section banners
-- This manages the 3 small banners that appear in each category section on the homepage

CREATE TABLE IF NOT EXISTS category_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL COMMENT 'Category this banner belongs to (e.g., Solar Outdoor, Lithium Batteries, Inverters)',
    image_url VARCHAR(500) NOT NULL COMMENT 'Path to the banner image',
    link_url VARCHAR(500) COMMENT 'URL to redirect when clicked',
    display_order INT DEFAULT 0 COMMENT 'Order of appearance (1-3 for each category)',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Banner visibility',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_status (category_name, status),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for existing categories
-- Solar Outdoor Lights (3 banners)
INSERT INTO category_banners (category_name, image_url, link_url, display_order, status) VALUES
('Solar Outdoor Lights', '/images/solar-water-pumping-inverters-for-sale-in-nairobi-kenya.webp', '/categories?category=Solar%20Outdoor%20Lights', 1, 'active'),
('Solar Outdoor Lights', '/images/growatt-solar-inverters-1.jpg', '/categories', 2, 'active'),
('Solar Outdoor Lights', '/images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg', '/categories', 3, 'active'),

-- Lithium Batteries (3 banners)
('Lithium Batteries', '/images/BYD-BATTERY-BOX.webp', '/categories?category=Batteries', 1, 'active'),
('Lithium Batteries', '/images/HeroMantion.jpg', '/categories', 2, 'active'),
('Lithium Batteries', '/images/Solar.png', '/categories', 3, 'active'),

-- Inverters (3 banners)
('Inverters', '/images/growatt-solar-inverters-1.jpg', '/categories?category=Inverters', 1, 'active'),
('Inverters', '/images/solar-water-pumping-inverters-for-sale-in-nairobi-kenya.webp', '/categories?category=Inverters', 2, 'active'),
('Inverters', '/images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg', '/categories', 3, 'active');

-- Query examples:
-- Get active banners for a specific category: SELECT * FROM category_banners WHERE category_name = 'Solar Outdoor Lights' AND status = 'active' ORDER BY display_order ASC LIMIT 3;
-- Get all categories with banners: SELECT DISTINCT category_name FROM category_banners WHERE status = 'active';
