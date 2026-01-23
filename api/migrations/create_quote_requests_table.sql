-- Create quote_requests table for client quote submissions
CREATE TABLE IF NOT EXISTS quote_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  appliances TEXT NOT NULL,
  analysis_data JSON,
  status ENUM('pending', 'reviewed', 'quoted', 'cancelled') DEFAULT 'pending',
  ai_quote_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_customer_email (customer_email),
  INDEX idx_request_number (request_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
