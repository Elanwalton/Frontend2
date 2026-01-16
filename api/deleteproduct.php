<?php
require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth || $auth['role'] !== 'admin') {
    sendError(403, 'Admin access required');
}


// Only allow DELETE method
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use DELETE method.'
    ]);
    exit;
    
}

// Get product ID from query parameter
$productId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($productId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid product ID'
    ]);
    exit;
}

// Check if product exists
$checkSql = "SELECT id FROM products WHERE id = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("i", $productId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Product not found'
    ]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Delete the product
$deleteSql = "DELETE FROM products WHERE id = ?";
$deleteStmt = $conn->prepare($deleteSql);
$deleteStmt->bind_param("i", $productId);

if ($deleteStmt->execute()) {
    if ($deleteStmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Product deleted successfully',
            'deletedId' => $productId
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete product'
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $deleteStmt->error
    ]);
}

$deleteStmt->close();
$conn->close();
?>
