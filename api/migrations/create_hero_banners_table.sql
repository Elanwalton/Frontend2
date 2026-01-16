-- Create hero_slides table for dynamic hero section with main and side banners
-- This supports the SolarStore.co.ke layout: 1 large main banner + 4 smaller side banners

CREATE TABLE IF NOT EXISTS hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL COMMENT 'Path to the banner image',
    title VARCHAR(255) NOT NULL COMMENT 'Banner title/heading',
    subtitle TEXT COMMENT 'Optional description text',
    link_url VARCHAR(500) COMMENT 'URL to redirect when clicked',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Banner visibility',
    display_order INT DEFAULT 0 COMMENT 'Order of appearance (lower = first)',
    position ENUM('main', 'side') DEFAULT 'main' COMMENT 'main = large carousel, side = small banners',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_position (status, position),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data: 1 main banner for carousel + 4 side banners
INSERT INTO hero_slides (image_url, title, subtitle, link_url, status, display_order, position) VALUES
-- Main carousel banner
('/images/HeroMantion.jpg', 'Power Your Future with Solar Energy', 'Premium solar panels and renewable energy solutions', '/categories?category=solar%20panels', 'active', 1, 'main'),

-- Side banners (4 smaller ones)
('/images/BYD-BATTERY-BOX.webp', 'Battery Storage', 'Advanced lithium solutions', '/categories?category=Batteries', 'active', 1, 'side'),
('/images/growatt-solar-inverters-1.jpg', 'Solar Inverters', 'High-performance conversion', '/categories?category=Inverters', 'active', 2, 'side'),
('/images/solar-water-pumping-inverters-for-sale-in-nairobi-kenya.webp', 'Water Pumps', 'Efficient solar pumping', '/categories', 'active', 3, 'side'),
('/images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg', 'Accessories', 'Complete solar kits', '/categories?category=Mounting%20Accesories', 'active', 4, 'side');

-- Queries for frontend
-- Get active main banners for carousel: SELECT * FROM hero_slides WHERE status = 'active' AND position = 'main' ORDER BY display_order ASC;
-- Get active side banners: SELECT * FROM hero_slides WHERE status = 'active' AND position = 'side' ORDER BY display_order ASC LIMIT 4;
