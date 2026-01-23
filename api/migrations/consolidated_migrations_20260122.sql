-- Consolidated Database Migrations - 2026-01-22
-- Quotation System Refinement

-- 1. Create quote_requests table for client quote submissions
CREATE TABLE IF NOT EXISTS quote_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  appliances TEXT,
  analysis_data JSON,
  status ENUM('pending', 'reviewed', 'quoted', 'cancelled', 'processing', 'sent', 'accepted', 'expired', 'rejected') DEFAULT 'pending',
  ai_quote_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_customer_email (customer_email),
  INDEX idx_request_number (request_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Ensure all columns exist in quote_requests (for existing tables)
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS request_number VARCHAR(50) UNIQUE AFTER id;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) AFTER request_number;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER customer_name;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) AFTER customer_email;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS appliances TEXT AFTER customer_phone;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS analysis_data JSON AFTER appliances;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS ai_quote_id VARCHAR(50) AFTER status;
ALTER TABLE quote_requests MODIFY COLUMN status ENUM('pending', 'reviewed', 'quoted', 'cancelled', 'processing', 'sent', 'accepted', 'expired', 'rejected') DEFAULT 'pending';

-- 3. Add metadata columns to quotations table for AI tracking and admin review
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS reviewed_by INT AFTER is_ai_generated,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL AFTER reviewed_by,
ADD COLUMN IF NOT EXISTS request_id INT AFTER reviewed_at;

-- 4. Create admin_settings table for storing system settings
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

-- 5. Insert default AI quote generation setting
INSERT INTO admin_settings (setting_key, setting_value, description) 
VALUES ('ai_quote_generation_enabled', 'true', 'Enable or disable AI-powered quote generation from client requests')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
