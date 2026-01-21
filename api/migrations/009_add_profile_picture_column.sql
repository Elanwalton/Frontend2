-- Migration: Add profile_picture column to users table
-- Date: 2026-01-21

ALTER TABLE users 
ADD COLUMN profile_picture VARCHAR(255) NULL 
COMMENT 'Path to user profile picture (relative to /images/)';

