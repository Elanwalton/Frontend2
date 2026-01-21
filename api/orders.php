<?php
require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth_tokens.php';

$conn = getDbConnection();

// Get and validate JWT access token
$accessToken = $_COOKIE['access_token'] ?? '';

if ($accessToken === '') {
    sendError(401, 'Unauthorized');
}

try {
    $payload = validateAccessToken($accessToken);
    $userId = (int)($payload['sub'] ?? 0);
    
    if ($userId <= 0) {
        sendError(401, 'Invalid access token');
    }
} catch (Throwable $e) {
    error_log('Token validation error in orders.php: ' . $e->getMessage());
    sendError(401, 'Unauthorized');
}

// Tables already exist in the database, no need to create them

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all orders for user with items - matching existing database schema
        $sql = "SELECT o.*, 
                       COUNT(oi.id) as item_count,
                       p.main_image_url as first_product_image
                FROM orders o 
                LEFT JOIN order_items oi ON o.id = oi.order_id 
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE o.user_id = ? 
                GROUP BY o.id 
                ORDER BY o.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Get order items
            $itemsSql = "SELECT oi.*, p.main_image_url as product_image
                        FROM order_items oi 
                        LEFT JOIN products p ON oi.product_id = p.id 
                        WHERE oi.order_id = ?";
            $itemsStmt = $conn->prepare($itemsSql);
            $itemsStmt->bind_param("i", $row['id']);
            $itemsStmt->execute();
            $itemsResult = $itemsStmt->get_result();
            
            $items = [];
            while ($item = $itemsResult->fetch_assoc()) {
                $items[] = [
                    'id' => $item['id'],
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'product_sku' => $item['product_sku'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'product_image' => $item['product_image'] ?: '/images/placeholder-product.jpg'
                ];
            }
            
            // Parse shipping address (stored as text, may need to convert to JSON format)
            $shippingAddress = null;
            if ($row['shipping_address']) {
                // Try to decode as JSON first, if fails treat as plain text
                $decoded = json_decode($row['shipping_address'], true);
                $shippingAddress = $decoded ?: ['address' => $row['shipping_address']];
            }
            
            $order = [
                'id' => $row['id'],
                'order_number' => $row['order_number'],
                'status' => $row['status'],
                'total_amount' => $row['total_amount'],
                'currency' => 'KES', // Default currency based on your data
                'payment_status' => $row['payment_status'],
                'order_date' => $row['created_at'],
                'shipped_date' => $row['shipped_at'],
                'delivered_date' => $row['delivered_at'],
                'shipping_address' => $shippingAddress,
                'billing_address' => $row['billing_address'] ? ['address' => $row['billing_address']] : null,
                'payment_method' => $row['payment_method'],
                'notes' => $row['notes'],
                'item_count' => $row['item_count'],
                'items' => $items,
                'customer_name' => $row['customer_name'],
                'customer_email' => $row['customer_email'],
                'customer_phone' => $row['customer_phone'],
                'tracking_number' => $row['tracking_number'],
                'carrier' => $row['carrier']
            ];
            
            $orders[] = $order;
        }
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        break;
        
    case 'POST':
        // Create new order (for future implementation)
        http_response_code(501);
        echo json_encode(['success' => false, 'message' => 'Order creation not implemented yet']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

$conn->close();
?>
