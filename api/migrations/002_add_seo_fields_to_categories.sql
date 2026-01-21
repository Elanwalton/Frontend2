-- =====================================================
-- ADD SEO FIELDS TO CATEGORIES TABLE
-- =====================================================

-- Add meta title
ALTER TABLE categories
ADD COLUMN meta_title VARCHAR(70) COMMENT 'SEO meta title' AFTER description;

-- Add meta description
ALTER TABLE categories
ADD COLUMN meta_description VARCHAR(160) COMMENT 'SEO meta description' AFTER meta_title;

-- Add keywords
ALTER TABLE categories
ADD COLUMN keywords VARCHAR(255) COMMENT 'SEO keywords (comma-separated)' AFTER meta_description;

-- Add icon
ALTER TABLE categories
ADD COLUMN icon VARCHAR(255) COMMENT 'Category icon URL or class' AFTER keywords;

-- Add banner image
ALTER TABLE categories
ADD COLUMN banner_image VARCHAR(500) COMMENT 'Category banner image URL' AFTER icon;

-- Add display order
ALTER TABLE categories
ADD COLUMN display_order INT DEFAULT 0 COMMENT 'Display order in navigation' AFTER banner_image;

-- Add index
ALTER TABLE categories
ADD INDEX idx_display_order (display_order);

-- Show success
SELECT 'Categories table updated with SEO fields!' as Status;
