-- Add missing columns to existing quote_requests table
ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS appliances TEXT AFTER customer_phone,
ADD COLUMN IF NOT EXISTS analysis_data JSON AFTER appliances,
ADD COLUMN IF NOT EXISTS ai_quote_id VARCHAR(50) AFTER status;

-- Update status enum to include new statuses if needed
ALTER TABLE quote_requests 
MODIFY COLUMN status ENUM('pending', 'reviewed', 'quoted', 'cancelled', 'processing', 'sent', 'accepted', 'expired', 'rejected') DEFAULT 'pending';
