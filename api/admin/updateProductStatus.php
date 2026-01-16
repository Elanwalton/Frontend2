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
$status = $input['status'] ?? null;

if (!$productId || $status === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID and status are required']);
    exit;
}

try {
    $query = "UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('si', $status, $productId);
    
    if ($stmt->execute()) {
        sendSuccess([
            'id' => $productId,
            'status' => $status,
            'message' => 'Product status updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update product status');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update product status',
        'error' => $e->getMessage()
    ]);
}
?>
