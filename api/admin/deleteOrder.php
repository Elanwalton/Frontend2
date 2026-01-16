<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

header('Content-Type: application/json');

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$orderNumber = isset($_GET['order_number']) ? trim((string)$_GET['order_number']) : '';

if ($orderNumber === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'order_number is required']);
    exit;
}

try {
    // Verify order exists
    $stmt = $conn->prepare('SELECT id FROM orders WHERE order_number = ? LIMIT 1');
    if (!$stmt) {
        throw new Exception('DB prepare failed (check): ' . $conn->error);
    }
    $stmt->bind_param('s', $orderNumber);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }

    $orderId = (int)$row['id'];

    // Delete order items first (foreign key)
    $stmt = $conn->prepare('DELETE FROM order_items WHERE order_id = ?');
    if (!$stmt) {
        throw new Exception('DB prepare failed (delete items): ' . $conn->error);
    }
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $deletedItems = $stmt->affected_rows;
    $stmt->close();

    // Delete the order
    $stmt = $conn->prepare('DELETE FROM orders WHERE id = ?');
    if (!$stmt) {
        throw new Exception('DB prepare failed (delete order): ' . $conn->error);
    }
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $deletedOrder = $stmt->affected_rows;
    $stmt->close();

    echo json_encode([
        'success' => true,
        'order_number' => $orderNumber,
        'deleted_items' => $deletedItems,
        'deleted_order' => $deletedOrder,
    ]);
} catch (Throwable $e) {
    error_log('deleteOrder error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
