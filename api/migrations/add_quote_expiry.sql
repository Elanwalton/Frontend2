-- Add expiry_date to quotations table
ALTER TABLE `quotations` ADD COLUMN `expiry_date` DATE NULL COMMENT 'Quote expiry date';

-- Set default expiry to 30 days from creation for existing records
UPDATE `quotations` 
SET `expiry_date` = DATE_ADD(`created_at`, INTERVAL 30 DAY) 
WHERE `expiry_date` IS NULL;

-- Add status column for better tracking
ALTER TABLE `quotations` ADD COLUMN `status` ENUM('pending', 'accepted', 'expired', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Quote status';

-- Update existing quotes to pending status
UPDATE `quotations` SET `status` = 'pending' WHERE `status` IS NULL;
