<?php
header("Content-Type: application/json");

// Load ApiHelper for proper CORS handling
require_once 'ApiHelper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDbConnection();

// Enforce admin via bearer token (production)
$token = getAuthToken();
validateAdminToken($conn, $token);


if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;
$is_featured = isset($data['is_featured']) ? (bool)$data['is_featured'] : false;
$priority = isset($data['priority']) ? (int)$data['priority'] : 0;

if ($product_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product ID'
    ]);
    exit;
}

// Update product featured status
$stmt = $conn->prepare("
    UPDATE products 
    SET is_featured = ?, 
        featured_priority = ?
    WHERE id = ?
");

$stmt->bind_param("iii", $is_featured, $priority, $product_id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => $is_featured ? 'Product featured successfully' : 'Product unfeatured successfully',
        'product_id' => $product_id,
        'is_featured' => $is_featured,
        'priority' => $priority
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update product: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>