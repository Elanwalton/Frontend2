CREATE TABLE IF NOT EXISTS search_keywords (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  normalized_keyword VARCHAR(255) NOT NULL,
  search_count INT UNSIGNED DEFAULT 1,
  result_count INT UNSIGNED DEFAULT 0,
  click_count INT UNSIGNED DEFAULT 0,
  conversion_count INT UNSIGNED DEFAULT 0,
  first_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_normalized (normalized_keyword),
  INDEX idx_keyword (keyword),
  INDEX idx_search_count (search_count DESC),
  INDEX idx_last_searched (last_searched DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
