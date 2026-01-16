-- Migration: Add product details columns
-- Run this SQL if your products table doesn't have these columns

-- Add short_description column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS short_description TEXT AFTER description;

-- Add rating column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00 AFTER stock_quantity;

-- Add review_count column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0 AFTER rating;

-- Add specifications column (JSON) if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS specifications JSON AFTER review_count;

-- Add features column (JSON) if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS features JSON AFTER specifications;

-- Add images column (JSON array) if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSON AFTER features;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_product_stock ON products(stock_quantity);

-- Sample data update (optional - adds default values to existing products)
UPDATE products 
SET 
    rating = 4.5,
    review_count = FLOOR(RAND() * 50) + 5,
    specifications = JSON_OBJECT(
        'Category', category,
        'Stock Status', IF(stock_quantity > 0, 'In Stock', 'Out of Stock'),
        'Warranty', '1 Year Manufacturer Warranty'
    ),
    features = JSON_ARRAY(
        'High Quality Product',
        'Manufacturer Warranty Included',
        'Free Shipping on Orders Over Ksh 5,000',
        '100% Genuine and Authentic',
        'Easy Returns Within 7 Days'
    ),
    images = JSON_ARRAY(main_image_url)
WHERE rating IS NULL OR rating = 0;

-- Verify the changes
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'products'
AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;
