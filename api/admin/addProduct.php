<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'] ?? null;
$description = $input['description'] ?? '';
$category = $input['category'] ?? null;
$price = $input['price'] ?? null;
$originalPrice = $input['originalPrice'] ?? null;
$discountPercentage = $input['discountPercentage'] ?? 0;
$stockQuantity = $input['stockQuantity'] ?? 0;
$status = $input['status'] ?? 'active';

if (!$name || !$category || $price === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, category, and price are required']);
    exit;
}

try {
    $query = "INSERT INTO products (
        name, description, category, price, original_price, discount_percentage,
        status, stock_quantity, rating, review_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    $stmt = $conn->prepare($query);
    $rating = 0;
    $reviewCount = 0;
    
    $stmt->bind_param(
        'sssdddsiii',
        $name,
        $description,
        $category,
        $price,
        $originalPrice,
        $discountPercentage,
        $status,
        $stockQuantity,
        $rating,
        $reviewCount
    );

    if ($stmt->execute()) {
        $productId = $conn->insert_id;
        sendSuccess([
            'id' => $productId,
            'name' => $name,
            'message' => 'Product added successfully'
        ]);
    } else {
        throw new Exception('Failed to add product');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add product',
        'error' => $e->getMessage()
    ]);
}
?>
