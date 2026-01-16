<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

// Get product ID from query parameter
$productId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($productId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product ID'
    ]);
    exit();
}

// Fetch product details
$sql = "SELECT 
    id,
    name,
    description,
    price,
    main_image_url,
    category,
    stock_quantity,
    rating,
    review_count,
    specifications,
    features,
    images,
    short_description,
    created_at,
    updated_at
FROM products 
WHERE id = ?
LIMIT 1";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $productId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$product = mysqli_fetch_assoc($result);
    
    if (!$product) {
        echo json_encode([
            'success' => false,
            'message' => 'Product not found'
        ]);
        exit();
    }
    
    // Parse JSON fields if they exist
    if (isset($product['specifications']) && !empty($product['specifications'])) {
        $product['specifications'] = json_decode($product['specifications'], true);
    } else {
        $product['specifications'] = [];
    }
    
    if (isset($product['features']) && !empty($product['features'])) {
        $product['features'] = json_decode($product['features'], true);
    } else {
        $product['features'] = [];
    }
    
    if (isset($product['images']) && !empty($product['images'])) {
        $product['images'] = json_decode($product['images'], true);
    } else {
        // If no images array, use main_image_url as the only image
        $product['images'] = [$product['main_image_url']];
    }
    
    // Convert numeric fields
    $product['id'] = intval($product['id']);
    $product['price'] = floatval($product['price']);
    $product['stock_quantity'] = intval($product['stock_quantity']);
    $product['rating'] = isset($product['rating']) ? floatval($product['rating']) : 0;
    $product['review_count'] = isset($product['review_count']) ? intval($product['review_count']) : 0;
    
    // Generate short description if not exists
    if (empty($product['short_description']) && !empty($product['description'])) {
        $product['short_description'] = substr($product['description'], 0, 150) . '...';
    }
    
    // Add default specifications if none exist
    if (empty($product['specifications'])) {
        $product['specifications'] = [
            'Category' => $product['category'],
            'Stock Status' => $product['stock_quantity'] > 0 ? 'In Stock' : 'Out of Stock',
            'Availability' => $product['stock_quantity'] > 10 ? 'Available' : ($product['stock_quantity'] > 0 ? 'Limited Stock' : 'Out of Stock')
        ];
    }
    
    // Add default features if none exist
    if (empty($product['features'])) {
        $product['features'] = [
            'High Quality Product',
            'Manufacturer Warranty Included',
            'Free Shipping on Orders Over Ksh 5,000',
            '100% Genuine and Authentic',
            'Easy Returns Within 7 Days'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $product
    ]);
    
if (!$product) {
    error_log("Product not found or database error in getProductDetails.php");
}
?>
