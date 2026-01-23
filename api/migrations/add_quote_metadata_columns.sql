-- Add metadata columns to quotations table for AI tracking and admin review
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS reviewed_by INT AFTER is_ai_generated,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL AFTER reviewed_by,
ADD COLUMN IF NOT EXISTS request_id INT AFTER reviewed_at;

-- Add foreign key constraints if they don't exist
-- Note: MySQL doesn't have IF NOT EXISTS for constraints, so we'll check in the migration runner
