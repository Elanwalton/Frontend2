<?php
// CORS headers
require_once __DIR__ . '/cors.php';

header("Content-Type: application/json");

// Database connection
require_once __DIR__ . '/connection.php';

// Get product ID from query parameter
$productId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($productId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product ID'
    ]);
    exit();
}

try {
    // Fetch product details - using only basic columns that should exist
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            description,
            price,
            main_image_url,
            category,
            stock_quantity
        FROM products 
        WHERE id = :id
        LIMIT 1
    ");
    
    $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
    $stmt->execute();
    
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        echo json_encode([
            'success' => false,
            'message' => 'Product not found'
        ]);
        exit();
    }
    
    // Convert numeric fields
    $product['id'] = intval($product['id']);
    $product['price'] = floatval($product['price']);
    $product['stock_quantity'] = intval($product['stock_quantity']);
    
    // Add computed/default fields
    $product['rating'] = 4.5; // Default rating
    $product['review_count'] = rand(10, 50); // Random review count
    
    // Generate short description from description
    $product['short_description'] = substr($product['description'], 0, 150) . '...';
    
    // Add default specifications
    $product['specifications'] = [
        'Category' => $product['category'],
        'Stock Status' => $product['stock_quantity'] > 0 ? 'In Stock' : 'Out of Stock',
        'Availability' => $product['stock_quantity'] > 10 ? 'Available' : ($product['stock_quantity'] > 0 ? 'Limited Stock' : 'Out of Stock'),
        'Warranty' => '1 Year Manufacturer Warranty',
        'Shipping' => 'Free Shipping on Orders Over Ksh 5,000'
    ];
    
    // Add default features
    $product['features'] = [
        'High Quality Product',
        'Manufacturer Warranty Included',
        'Free Shipping on Orders Over Ksh 5,000',
        '100% Genuine and Authentic',
        'Easy Returns Within 7 Days',
        'Secure Payment Options',
        'Expert Customer Support'
    ];
    
    // Use main image as the only image in array
    $product['images'] = [$product['main_image_url']];
    
    echo json_encode([
        'success' => true,
        'data' => $product
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in getProductDetailsSimple.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
