-- Create admin_settings table for storing system settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(255),
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default AI quote generation setting
INSERT INTO admin_settings (setting_key, setting_value, description) 
VALUES ('ai_quote_generation_enabled', 'true', 'Enable or disable AI-powered quote generation from client requests')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
