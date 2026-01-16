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

$orderNumber = isset($_GET['order_number']) ? trim((string)$_GET['order_number']) : '';
if ($orderNumber === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'order_number is required']);
    exit;
}

try {
    $stmt = $conn->prepare(
        'SELECT id, order_number, user_id, customer_name, customer_email, customer_phone, '
        . 'shipping_address, billing_address, subtotal, tax, shipping_cost, discount, total_amount, '
        . 'status, payment_status, payment_method, notes, tracking_number, carrier, shipped_at, delivered_at, estimated_delivery, '
        . 'created_at, updated_at '
        . 'FROM orders WHERE order_number = ? LIMIT 1'
    );
    if (!$stmt) {
        throw new Exception('DB prepare failed (order): ' . $conn->error);
    }
    $stmt->bind_param('s', $orderNumber);
    $stmt->execute();
    $orderRes = $stmt->get_result();
    $order = $orderRes->fetch_assoc();
    $stmt->close();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }

    $orderId = (int)$order['id'];

    $itemsStmt = $conn->prepare(
        'SELECT id, product_id, product_name, product_sku, quantity, unit_price, total_price, created_at '
        . 'FROM order_items WHERE order_id = ? ORDER BY id ASC'
    );
    if (!$itemsStmt) {
        throw new Exception('DB prepare failed (items): ' . $conn->error);
    }
    $itemsStmt->bind_param('i', $orderId);
    $itemsStmt->execute();
    $itemsRes = $itemsStmt->get_result();

    $items = [];
    while ($r = $itemsRes->fetch_assoc()) {
        $items[] = [
            'id' => (int)$r['id'],
            'product_id' => $r['product_id'] !== null ? (int)$r['product_id'] : null,
            'product_name' => (string)$r['product_name'],
            'product_sku' => $r['product_sku'] !== null ? (string)$r['product_sku'] : '',
            'quantity' => (int)$r['quantity'],
            'unit_price' => (float)$r['unit_price'],
            'total_price' => (float)$r['total_price'],
            'created_at' => $r['created_at'],
        ];
    }
    $itemsStmt->close();

    // Normalize numeric fields
    $orderOut = [
        'id' => (int)$order['id'],
        'order_number' => (string)$order['order_number'],
        'user_id' => $order['user_id'] !== null ? (int)$order['user_id'] : null,
        'customer_name' => (string)$order['customer_name'],
        'customer_email' => (string)$order['customer_email'],
        'customer_phone' => $order['customer_phone'] !== null ? (string)$order['customer_phone'] : null,
        'shipping_address' => $order['shipping_address'],
        'billing_address' => $order['billing_address'],
        'subtotal' => (float)($order['subtotal'] ?? 0),
        'tax' => (float)($order['tax'] ?? 0),
        'shipping_cost' => (float)($order['shipping_cost'] ?? 0),
        'discount' => (float)($order['discount'] ?? 0),
        'total_amount' => (float)($order['total_amount'] ?? 0),
        'status' => (string)$order['status'],
        'payment_status' => (string)$order['payment_status'],
        'payment_method' => $order['payment_method'] !== null ? (string)$order['payment_method'] : null,
        'notes' => $order['notes'] !== null ? (string)$order['notes'] : null,
        'tracking_number' => $order['tracking_number'] !== null ? (string)$order['tracking_number'] : null,
        'carrier' => $order['carrier'] !== null ? (string)$order['carrier'] : null,
        'shipped_at' => $order['shipped_at'],
        'delivered_at' => $order['delivered_at'],
        'estimated_delivery' => $order['estimated_delivery'],
        'created_at' => $order['created_at'],
        'updated_at' => $order['updated_at'],
    ];

    echo json_encode([
        'success' => true,
        'order' => $orderOut,
        'items' => $items,
    ]);
} catch (Throwable $e) {
    error_log('getOrderDetails error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
