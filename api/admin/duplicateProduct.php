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
$productId = $input['productId'] ?? null;

if (!$productId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit;
}

try {
    // Get the product to duplicate
    $query = "SELECT * FROM products WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit;
    }

    // Create a duplicate
    $insertQuery = "INSERT INTO products (
        name, description, category, price, original_price, discount_percentage,
        rating, review_count, thumbnail_urls, highlights, status, stock_quantity,
        colors, sizes, specifications, reviews, badges, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    $stmt = $conn->prepare($insertQuery);
    $newName = $product['name'] . ' (Copy)';
    $stmt->bind_param(
        'sssdddiissssisss',
        $newName,
        $product['description'],
        $product['category'],
        $product['price'],
        $product['original_price'],
        $product['discount_percentage'],
        $product['rating'],
        $product['review_count'],
        $product['thumbnail_urls'],
        $product['highlights'],
        $product['status'],
        $product['stock_quantity'],
        $product['colors'],
        $product['sizes'],
        $product['specifications'],
        $product['reviews'],
        $product['badges']
    );

    if ($stmt->execute()) {
        $newProductId = $conn->insert_id;
        sendSuccess([
            'id' => $newProductId,
            'message' => 'Product duplicated successfully'
        ]);
    } else {
        throw new Exception('Failed to duplicate product');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to duplicate product',
        'error' => $e->getMessage()
    ]);
}
?>
