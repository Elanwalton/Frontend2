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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '[]', true);
if (!is_array($body)) $body = [];

$orderNumber = isset($body['order_number']) ? trim((string)$body['order_number']) : '';
$newStatus = isset($body['status']) ? trim((string)$body['status']) : '';

$shippingAddress = array_key_exists('shipping_address', $body) ? trim((string)$body['shipping_address']) : null;
$trackingNumber = array_key_exists('tracking_number', $body) ? trim((string)$body['tracking_number']) : null;
$carrier = array_key_exists('carrier', $body) ? trim((string)$body['carrier']) : null;

if ($orderNumber === '' || $newStatus === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'order_number and status are required']);
    exit;
}

$allowed = ['pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled', 'refunded'];
if (!in_array($newStatus, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

try {
    $stmt = $conn->prepare('SELECT id, status FROM orders WHERE order_number = ? LIMIT 1');
    if (!$stmt) {
        throw new Exception('DB prepare failed (get): ' . $conn->error);
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

    $currentStatus = (string)$row['status'];

    $normalizeStatus = function ($s) {
        return strtolower(trim((string)$s));
    };
    $curr = $normalizeStatus($currentStatus);
    $next = $normalizeStatus($newStatus);

    $allowedTransitions = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered', 'cancelled'],
        'delivered' => ['cancelled'],
        'completed' => ['cancelled'],
        'cancelled' => [],
        'refunded' => [],
    ];

    if ($curr !== $next) {
        $can = $allowedTransitions[$curr] ?? [];
        if (!in_array($next, $can, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid status transition']);
            exit;
        }
    }

    // Allow cancellation anytime (except terminal states already guarded by transition rules)

    // Tracking/carrier should only be set when shipping/delivered
    $hasTrackingUpdate = $trackingNumber !== null || $carrier !== null;
    if ($hasTrackingUpdate && !in_array($next, ['shipped', 'delivered'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tracking details can only be updated when order is shipped or delivered']);
        exit;
    }

    $updates = [];
    $types = '';
    $params = [];

    $updates[] = 'status = ?';
    $types .= 's';
    $params[] = $next;

    $updates[] = 'updated_at = CURRENT_TIMESTAMP';

    if ($next === 'shipped') {
        $updates[] = 'shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP)';
    }
    if ($next === 'delivered') {
        $updates[] = 'delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP)';
    }

    if ($shippingAddress !== null) {
        $updates[] = 'shipping_address = ?';
        $types .= 's';
        $params[] = $shippingAddress;
    }
    if ($trackingNumber !== null) {
        $updates[] = 'tracking_number = ?';
        $types .= 's';
        $params[] = ($trackingNumber === '' ? null : $trackingNumber);
    }
    if ($carrier !== null) {
        $updates[] = 'carrier = ?';
        $types .= 's';
        $params[] = ($carrier === '' ? null : $carrier);
    }

    $sql = 'UPDATE orders SET ' . implode(', ', $updates) . ' WHERE order_number = ?';
    $types .= 's';
    $params[] = $orderNumber;

    $u = $conn->prepare($sql);
    if (!$u) {
        throw new Exception('DB prepare failed (update): ' . $conn->error);
    }

    $u->bind_param($types, ...$params);
    $u->execute();
    $affected = $u->affected_rows;
    $u->close();

    echo json_encode([
        'success' => true,
        'updated' => $affected,
        'order_number' => $orderNumber,
        'from' => $currentStatus,
        'to' => $next,
    ]);
} catch (Throwable $e) {
    error_log('updateOrderStatus error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
