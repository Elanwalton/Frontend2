-- =====================================================
-- CREATE SEO METADATA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS seo_metadata (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Entity Reference
  entity_type ENUM('product', 'category', 'page', 'blog') NOT NULL COMMENT 'Type of entity',
  entity_id INT UNSIGNED NOT NULL COMMENT 'ID of the entity',
  
  -- Basic Meta Tags
  meta_title VARCHAR(70) DEFAULT NULL COMMENT 'SEO title (max 70 chars for Google)',
  meta_description VARCHAR(160) DEFAULT NULL COMMENT 'SEO description (max 160 chars)',
  meta_keywords VARCHAR(255) DEFAULT NULL COMMENT 'SEO keywords (comma-separated)',
  focus_keyword VARCHAR(100) DEFAULT NULL COMMENT 'Primary keyword to rank for',
  
  -- Open Graph (Facebook, LinkedIn)
  og_title VARCHAR(70) DEFAULT NULL COMMENT 'Open Graph title',
  og_description VARCHAR(160) DEFAULT NULL COMMENT 'Open Graph description',
  og_image VARCHAR(500) DEFAULT NULL COMMENT 'Open Graph image URL',
  og_type VARCHAR(50) DEFAULT 'website' COMMENT 'Open Graph type (website, product, article)',
  
  -- Twitter Card
  twitter_card VARCHAR(50) DEFAULT 'summary_large_image' COMMENT 'Twitter card type',
  twitter_title VARCHAR(70) DEFAULT NULL COMMENT 'Twitter title',
  twitter_description VARCHAR(160) DEFAULT NULL COMMENT 'Twitter description',
  twitter_image VARCHAR(500) DEFAULT NULL COMMENT 'Twitter image URL',
  
  -- Technical SEO
  canonical_url VARCHAR(500) DEFAULT NULL COMMENT 'Canonical URL to prevent duplicate content',
  robots_index BOOLEAN DEFAULT TRUE COMMENT 'Allow search engines to index',
  robots_follow BOOLEAN DEFAULT TRUE COMMENT 'Allow search engines to follow links',
  
  -- Structured Data
  schema_markup JSON DEFAULT NULL COMMENT 'Schema.org JSON-LD markup',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  UNIQUE KEY unique_entity (entity_type, entity_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_robots (robots_index, robots_follow),
  INDEX idx_focus_keyword (focus_keyword)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='SEO metadata for all entities';

-- Show success
SELECT 'SEO Metadata table created successfully!' as Status;
