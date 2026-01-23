-- Migration: Add recovery_email_sent_at to orders table
-- Created at: 2026-01-23
-- Purpose: Track when abandoned cart recovery emails are sent to prevent duplicate sends

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS recovery_email_sent_at TIMESTAMP NULL DEFAULT NULL AFTER status;

-- Add index to optimize queries looking for pending orders that haven't been recovered yet
CREATE INDEX idx_orders_recovery_status ON orders (status, recovery_email_sent_at);
