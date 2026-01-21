-- =====================================================
-- ADD SEO FIELDS TO PRODUCTS TABLE
-- =====================================================

-- Add slug column (URL-friendly identifier)
ALTER TABLE products
ADD COLUMN slug VARCHAR(255) UNIQUE COMMENT 'URL-friendly product identifier' AFTER name;

-- Add meta title
ALTER TABLE products
ADD COLUMN meta_title VARCHAR(70) COMMENT 'SEO meta title (max 70 chars)' AFTER slug;

-- Add meta description
ALTER TABLE products
ADD COLUMN meta_description VARCHAR(160) COMMENT 'SEO meta description (max 160 chars)' AFTER meta_title;

-- Add focus keyword
ALTER TABLE products
ADD COLUMN focus_keyword VARCHAR(100) COMMENT 'Primary SEO keyword' AFTER meta_description;

-- Add alt text for main image
ALTER TABLE products
ADD COLUMN alt_text VARCHAR(255) COMMENT 'Alt text for main product image' AFTER main_image_url;

-- Add indexes for SEO
ALTER TABLE products
ADD INDEX idx_slug (slug);

-- Add fulltext search index
ALTER TABLE products
ADD FULLTEXT KEY ft_seo_search (name, meta_title, meta_description, description);

-- Show success
SELECT 'Products table updated with SEO fields!' as Status;
