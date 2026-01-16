<?php
header("Content-Type: application/json");

// Load ApiHelper for proper CORS handling
require_once 'ApiHelper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'connection.php';

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;
$event_type = isset($data['event_type']) ? $data['event_type'] : '';

// Validate inputs
if ($product_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
    exit;
}

$valid_events = ['view', 'add_to_cart', 'purchase', 'wishlist'];
if (!in_array($event_type, $valid_events)) {
    echo json_encode(['success' => false, 'message' => 'Invalid event type']);
    exit;
}

$today = date('Y-m-d');

// Insert or update analytics
$stmt = $conn->prepare("
    INSERT INTO product_analytics (product_id, event_type, event_date, event_count)
    VALUES (?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE event_count = event_count + 1
");

$stmt->bind_param("iss", $product_id, $event_type, $today);

if ($stmt->execute()) {
    // Update product counters
    if ($event_type === 'view') {
        $conn->query("UPDATE products SET view_count = view_count + 1 WHERE id = $product_id");
    } elseif ($event_type === 'purchase') {
        $conn->query("UPDATE products SET sales_count = sales_count + 1 WHERE id = $product_id");
    }
    
    echo json_encode(['success' => true, 'message' => 'Event tracked']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to track event']);
}

$stmt->close();
$conn->close();
?>