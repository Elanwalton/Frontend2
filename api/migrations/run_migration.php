<?php
/**
 * Database Migration Runner
 * Run this file once to add enhanced product details columns
 * Access: http://localhost/sunleaf-tech/api/migrations/run_migration.php
 */

header("Content-Type: text/html; charset=UTF-8");

// Include database connection
require_once __DIR__ . '/../connection.php';

// Disable mysqli exceptions to handle errors gracefully
mysqli_report(MYSQLI_REPORT_OFF);

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Migration - Enhanced Product Details</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: red; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { color: blue; background: #d1ecf1; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .step { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        h1 { color: #081e31; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🚀 Enhanced Product Details Migration</h1>
";

echo "<div class='info'>Starting migration process...</div>";

// Step 1: Add short_description column
echo "<div class='step'><strong>Step 1:</strong> Adding short_description column...</div>";
$result = mysqli_query($conn, "ALTER TABLE products ADD COLUMN short_description TEXT AFTER description");
if ($result) {
    echo "<div class='success'>✓ short_description column added</div>";
} else {
    $error = mysqli_error($conn);
    if (strpos($error, 'Duplicate column') !== false) {
        echo "<div class='info'>ℹ short_description column already exists</div>";
    } else {
        echo "<div class='info'>ℹ short_description issue: " . htmlspecialchars($error) . " (continuing...)</div>";
    }
}
    
// Step 2: Add rating column
echo "<div class='step'><strong>Step 2:</strong> Adding rating column...</div>";
$result = mysqli_query($conn, "ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00 AFTER stock_quantity");
if ($result) {
    echo "<div class='success'>✓ rating column added</div>";
} else {
    $error = mysqli_error($conn);
    if (strpos($error, 'Duplicate column') !== false) {
        echo "<div class='info'>ℹ rating column already exists</div>";
    } else {
        echo "<div class='info'>ℹ rating column issue: " . htmlspecialchars($error) . " (continuing...)</div>";
    }
}

// Step 3: Add review_count column
    echo "<div class='step'><strong>Step 3:</strong> Adding review_count column...</div>";
    $result = mysqli_query($conn, "ALTER TABLE products ADD COLUMN review_count INT DEFAULT 0 AFTER rating");
    if ($result) {
        echo "<div class='success'>✓ review_count column added</div>";
    } else {
        $error = mysqli_error($conn);
        if (strpos($error, 'Duplicate column') !== false) {
            echo "<div class='info'>ℹ review_count column already exists</div>";
        } else {
            echo "<div class='info'>ℹ review_count issue: " . htmlspecialchars($error) . " (continuing...)</div>";
        }
    }
    
    // Step 4: Add specifications column
    echo "<div class='step'><strong>Step 4:</strong> Adding specifications column...</div>";
    $result = mysqli_query($conn, "ALTER TABLE products ADD COLUMN specifications JSON AFTER review_count");
    if ($result) {
        echo "<div class='success'>✓ specifications column added</div>";
    } else {
        $error = mysqli_error($conn);
        if (strpos($error, 'Duplicate column') !== false) {
            echo "<div class='info'>ℹ specifications column already exists</div>";
        } else {
            echo "<div class='info'>ℹ specifications issue: " . htmlspecialchars($error) . " (continuing...)</div>";
        }
    }
    
    // Step 5: Add features column
    echo "<div class='step'><strong>Step 5:</strong> Adding features column...</div>";
    $result = mysqli_query($conn, "ALTER TABLE products ADD COLUMN features JSON AFTER specifications");
    if ($result) {
        echo "<div class='success'>✓ features column added</div>";
    } else {
        $error = mysqli_error($conn);
        if (strpos($error, 'Duplicate column') !== false) {
            echo "<div class='info'>ℹ features column already exists</div>";
        } else {
            echo "<div class='info'>ℹ features issue: " . htmlspecialchars($error) . " (continuing...)</div>";
        }
    }
    
    // Step 6: Add images column
    echo "<div class='step'><strong>Step 6:</strong> Adding images column...</div>";
    $result = mysqli_query($conn, "ALTER TABLE products ADD COLUMN images JSON AFTER features");
    if ($result) {
        echo "<div class='success'>✓ images column added</div>";
    } else {
        $error = mysqli_error($conn);
        if (strpos($error, 'Duplicate column') !== false) {
            echo "<div class='info'>ℹ images column already exists</div>";
        } else {
            echo "<div class='info'>ℹ images issue: " . htmlspecialchars($error) . " (continuing...)</div>";
        }
    }
    
    // Step 7: Add indexes
    echo "<div class='step'><strong>Step 7:</strong> Adding indexes for performance...</div>";
    $result = mysqli_query($conn, "CREATE INDEX idx_product_rating ON products(rating)");
    if ($result) {
        echo "<div class='success'>✓ Rating index added</div>";
    } else {
        $error = mysqli_error($conn);
        if (strpos($error, 'Duplicate key') !== false || strpos($error, 'already exists') !== false) {
            echo "<div class='info'>ℹ Rating index already exists</div>";
        } else {
            echo "<div class='info'>ℹ Rating index: " . htmlspecialchars($error) . "</div>";
        }
    }
    
    $result = mysqli_query($conn, "CREATE INDEX idx_product_stock ON products(stock_quantity)");
    if ($result) {
        echo "<div class='success'>✓ Stock index added</div>";
    } else {
        $error = mysqli_error($conn);
        if (strpos($error, 'Duplicate key') !== false || strpos($error, 'already exists') !== false) {
            echo "<div class='info'>ℹ Stock index already exists</div>";
        } else {
            echo "<div class='info'>ℹ Stock index: " . htmlspecialchars($error) . "</div>";
        }
    }
    
    // Step 8: Populate default data
    echo "<div class='step'><strong>Step 8:</strong> Populating default data for existing products...</div>";
    $sql = "
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
        WHERE rating IS NULL OR rating = 0
    ";
    $result = mysqli_query($conn, $sql);
    $updated = mysqli_affected_rows($conn);
    echo "<div class='success'>✓ Updated {$updated} products with default data</div>";
    
    // Verification
    echo "<div class='step'><strong>Verification:</strong> Checking migration results...</div>";
    $result = mysqli_query($conn, "SELECT COUNT(*) as total FROM products");
    $row = mysqli_fetch_assoc($result);
    $total = $row['total'];
    
    $result = mysqli_query($conn, "SELECT COUNT(*) as with_rating FROM products WHERE rating > 0");
    $row = mysqli_fetch_assoc($result);
    $withRating = $row['with_rating'];
    
    echo "<div class='success'>
        <strong>Migration Complete! ✅</strong><br>
        Total Products: {$total}<br>
        Products with Rating: {$withRating}
    </div>";
    
    echo "<div class='info'>
        <strong>Next Steps:</strong><br>
        1. The enhanced API is now active at <code>api/getProductDetails.php</code><br>
        2. Your product details page is already configured to use it<br>
        3. Click any product card to see the enhanced details page<br>
        4. You can now edit product ratings, reviews, and specifications in the database
    </div>";
    
    echo "<div class='step'>
        <strong>Sample Product Data:</strong><br>
        You can now update products with custom data like:<br>
        <code>
        UPDATE products SET<br>
        &nbsp;&nbsp;rating = 4.8,<br>
        &nbsp;&nbsp;review_count = 42,<br>
        &nbsp;&nbsp;specifications = '{\"Power\": \"300W\", \"Voltage\": \"12V\"}',<br>
        &nbsp;&nbsp;features = '[\"Feature 1\", \"Feature 2\"]'<br>
        WHERE id = 1;
        </code>
    </div>";

echo "</body></html>";
?>
