-- Quick Setup for Enhanced Product Details
-- Copy and paste this entire file into phpMyAdmin SQL tab

USE sunleaf_tech;

-- Add new columns
ALTER TABLE products ADD COLUMN short_description TEXT AFTER description;
ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00 AFTER stock_quantity;
ALTER TABLE products ADD COLUMN review_count INT DEFAULT 0 AFTER rating;
ALTER TABLE products ADD COLUMN specifications JSON AFTER review_count;
ALTER TABLE products ADD COLUMN features JSON AFTER specifications;
ALTER TABLE products ADD COLUMN images JSON AFTER features;

-- Add indexes
CREATE INDEX idx_product_rating ON products(rating);
CREATE INDEX idx_product_stock ON products(stock_quantity);

-- Add default data to existing products
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
    images = JSON_ARRAY(main_image_url),
    short_description = SUBSTRING(description, 1, 150)
WHERE rating IS NULL OR rating = 0;

-- Verify the setup
SELECT 'Setup Complete!' as Status;
SELECT COUNT(*) as Total_Products FROM products;
SELECT COUNT(*) as Products_With_Rating FROM products WHERE rating > 0;
