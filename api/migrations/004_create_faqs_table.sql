-- =====================================================
-- CREATE FAQS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Content
  question VARCHAR(500) NOT NULL COMMENT 'FAQ question',
  answer TEXT NOT NULL COMMENT 'FAQ answer (HTML allowed)',
  
  -- Organization
  category VARCHAR(100) DEFAULT NULL COMMENT 'FAQ category (e.g., Shipping, Returns, Products)',
  product_id INT UNSIGNED DEFAULT NULL COMMENT 'Related product ID (optional)',
  display_order INT DEFAULT 0 COMMENT 'Display order within category',
  
  -- Status
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'FAQ status',
  
  -- Analytics
  view_count INT UNSIGNED DEFAULT 0 COMMENT 'Number of views',
  helpful_count INT UNSIGNED DEFAULT 0 COMMENT 'Number of "helpful" votes',
  not_helpful_count INT UNSIGNED DEFAULT 0 COMMENT 'Number of "not helpful" votes',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_category (category),
  INDEX idx_product (product_id),
  INDEX idx_status (status),
  INDEX idx_display_order (display_order),
  INDEX idx_helpful (helpful_count DESC),
  FULLTEXT KEY ft_search (question, answer)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Frequently Asked Questions for SEO schema markup';

-- Show success
SELECT 'FAQs table created successfully!' as Status;
