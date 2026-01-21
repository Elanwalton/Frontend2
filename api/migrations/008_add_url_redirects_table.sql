-- =====================================================
-- URL Redirects Table
-- Manages 301/302 redirects for SEO
-- =====================================================

CREATE TABLE IF NOT EXISTS url_redirects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Redirect Configuration
  old_url VARCHAR(500) NOT NULL COMMENT 'Original URL to redirect from',
  new_url VARCHAR(500) NOT NULL COMMENT 'New URL to redirect to',
  redirect_type ENUM('301', '302', '307') DEFAULT '301' COMMENT '301=Permanent, 302=Temporary, 307=Temporary (POST preserved)',
  
  -- Status & Analytics
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Redirect status',
  hit_count INT UNSIGNED DEFAULT 0 COMMENT 'Number of times redirect was used',
  last_accessed TIMESTAMP NULL DEFAULT NULL COMMENT 'Last time redirect was triggered',
  
  -- Metadata
  notes TEXT DEFAULT NULL COMMENT 'Admin notes about this redirect',
  created_by INT UNSIGNED DEFAULT NULL COMMENT 'User who created redirect',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  UNIQUE KEY unique_old_url (old_url),
  INDEX idx_status (status),
  INDEX idx_redirect_type (redirect_type),
  INDEX idx_hit_count (hit_count DESC)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='URL redirects for SEO and site maintenance';
