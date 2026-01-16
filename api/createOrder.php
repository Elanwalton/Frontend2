<?php
/**
 * createOrder.php
 * Production-level order creation API
 * Handles order creation with inventory management, validation, and error handling
 */

require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/NotificationService.php';

$conn = getDbConnection();

// Start session for user authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => 86400,
        'cookie_path'     => '/',
        'cookie_secure'   => false,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
    ]);
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['customer_info', 'cart_items', 'total_amount', 'payment_method'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Missing required field: $field"
        ]);
        exit;
    }
}

$customer_info = $input['customer_info'];
$cart_items = $input['cart_items'];
$total_amount = $input['total_amount'];
$payment_method = $input['payment_method'];
$shipping_address = $input['shipping_address'] ?? '';
$applied_coupon = $input['applied_coupon'] ?? null;
$notes = $input['notes'] ?? '';

// Validate customer info
$customer_required = ['name', 'email', 'phone'];
foreach ($customer_required as $field) {
    if (empty($customer_info[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Missing customer information: $field"
        ]);
        exit;
    }
}

// Validate email
if (!filter_var($customer_info['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email address'
    ]);
    exit;
}

// Validate phone number
if (!preg_match('/^(07|01)[0-9]{8}$/', $customer_info['phone'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid phone number format'
    ]);
    exit;
}

// Validate cart items
if (empty($cart_items) || !is_array($cart_items)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Cart items are required'
    ]);
    exit;
}

// Validate total amount
if (!is_numeric($total_amount) || $total_amount <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid total amount'
    ]);
    exit;
}

$conn->begin_transaction();

$order_items_stmt = null;
$stock_movement_stmt = null;

try {
    // Generate unique order number
    $order_number = 'ORD-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    
    // Get user ID if logged in, otherwise null
    $user_id = $_SESSION['user_id'] ?? null;
    
    // Calculate totals
    $subtotal = 0;
    $tax = 0;
    $shipping_cost = 0;
    
    foreach ($cart_items as $item) {
        $subtotal += ($item['price'] * $item['quantity']);
    }
    
    // No tax calculation - use provided total directly
    $tax = 0;
    
    // Calculate shipping (free for orders over 5000, otherwise 250)
    $shipping_cost = $subtotal >= 5000 ? 0 : 250;
    
    // Use provided total amount (already includes tax and shipping)
    $calculated_total = $total_amount;
    
    // Check inventory and lock products
    $product_ids = array_column($cart_items, 'id');
    if (empty($product_ids)) {
        throw new Exception('No valid products in cart');
    }
    
    $placeholders = str_repeat('?,', count($product_ids) - 1) . '?';
    $inventory_check = "SELECT id, name, stock_quantity, price FROM products WHERE id IN ($placeholders) FOR UPDATE";
    $stmt = $conn->prepare($inventory_check);
    $stmt->bind_param(str_repeat('i', count($product_ids)), ...$product_ids);
    $stmt->execute();
    $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    if (count($products) !== count($product_ids)) {
        throw new Exception('Some products not found');
    }
    
    // Create product lookup map
    $product_map = [];
    foreach ($products as $product) {
        $product_map[$product['id']] = $product;
    }
    
    // Validate cart items against inventory
    foreach ($cart_items as $item) {
        $product = $product_map[$item['id']];
        
        // Check if enough stock
        if ($product['stock_quantity'] < $item['quantity']) {
            throw new Exception("Insufficient stock for product: {$product['name']}. Available: {$product['stock_quantity']}, Requested: {$item['quantity']}");
        }
        
        // Validate price
        if (abs($product['price'] - $item['price']) > 0.01) {
            throw new Exception("Price mismatch for product: {$product['name']}");
        }
    }
    
    // Create order
    $order_query = "INSERT INTO orders (
        order_number, 
        user_id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        shipping_address,
        subtotal, 
        tax, 
        shipping_cost, 
        total_amount, 
        status, 
        payment_status, 
        payment_method, 
        notes,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, NOW())";
    $stmt = $conn->prepare($order_query);
    $stmt->bind_param(
        "ssssssddddss",
        $order_number,
        $user_id,
        $customer_info['name'],
        $customer_info['email'],
        $customer_info['phone'],
        $shipping_address,
        $subtotal,
        $tax,
        $shipping_cost,
        $total_amount,
        $payment_method,
        $notes
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create order');
    }
    
    $order_id = $conn->insert_id;

    $order_items_query = "INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price
    ) VALUES (?, ?, ?, ?, ?, ?)";

    $order_items_stmt = $conn->prepare($order_items_query);
    if (!$order_items_stmt) {
        throw new Exception('Failed to prepare order items statement');
    }

    foreach ($cart_items as $item) {
        $product_id = $item['id'] ?? null;
        $product_name = $item['name'] ?? ($item['title'] ?? 'Unnamed Product');
        $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
        $unit_price = isset($item['price']) ? (float)$item['price'] : 0.0;
        $total_price = $unit_price * $quantity;

        if (!$order_items_stmt->bind_param(
            "iisidd",
            $order_id,
            $product_id,
            $product_name,
            $quantity,
            $unit_price,
            $total_price
        )) {
            throw new Exception('Failed to bind order item parameters');
        }

        if (!$order_items_stmt->execute()) {
            throw new Exception('Failed to create order item for product: ' . $product_name);
        }
    }

    // Record stock movements (trigger updates inventory levels)
    $stock_movement_query = "INSERT INTO stock_movements (
        product_id,
        quantity_change,
        movement_type,
        reference_id,
        reference_type,
        notes
    ) VALUES (?, ?, ?, ?, ?, ?)";

    $stock_movement_stmt = $conn->prepare($stock_movement_query);
    if (!$stock_movement_stmt) {
        throw new Exception('Failed to prepare stock movement statement');
    }

    $movement_type = 'sale';
    $reference_type = 'order';
    $reference_id = $order_id;
    $movement_notes = '';
    $product_id_param = 0;
    $quantity_change = 0;

    if (!$stock_movement_stmt->bind_param(
        "iisiss",
        $product_id_param,
        $quantity_change,
        $movement_type,
        $reference_id,
        $reference_type,
        $movement_notes
    )) {
        throw new Exception('Failed to bind stock movement parameters');
    }

    foreach ($cart_items as $item) {
        $product = $product_map[$item['id']];
        $product_id_param = (int)$item['id'];
        $quantity_change = (int)$item['quantity'];
        $movement_notes = "Order #{$order_number} - Sold {$item['quantity']} units";

        if (!$stock_movement_stmt->execute()) {
            throw new Exception("Failed to log stock movement for product: {$product['name']}");
        }
    }
    
    // Handle coupon if applied
    if ($applied_coupon) {
        // Update coupon usage
        $update_coupon = "UPDATE coupons SET used_count = used_count + 1 WHERE code = ?";
        $stmt = $conn->prepare($update_coupon);
        $stmt->bind_param("s", $applied_coupon['code']);
        $stmt->execute();
        
        // Record coupon usage
        $coupon_usage_query = "INSERT INTO coupon_usage (
            coupon_code, 
            order_id, 
            user_id, 
            discount_amount, 
            created_at
        ) VALUES (?, ?, ?, ?, NOW())";
        
        $stmt = $conn->prepare($coupon_usage_query);
        $stmt->bind_param("siid", $applied_coupon['code'], $order_id, $user_id, $applied_coupon['discount_amount']);
        $stmt->execute();
    }
    
    // Commit transaction
    $conn->commit();

    // Broadcast notification to all admins
    try {
        NotificationService::broadcastToAdmins(
            $conn,
            'order',
            'New order received',
            "Order {$order_number} has been created.",
            '/admin-dashboard/orders/pending'
        );
    } catch (Throwable $e) {
        // Do not fail order creation if notifications fail
        error_log('Failed to create order notification: ' . $e->getMessage());
    }
    
    // Send confirmation email (you can implement this later)
    // sendOrderConfirmationEmail($customer_info['email'], $order_number, $cart_items, $total_amount);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'data' => [
            'order_id' => $order_id,
            'order_number' => $order_number,
            'total_amount' => $total_amount,
            'status' => 'pending',
            'payment_status' => 'pending',
            'customer_info' => $customer_info,
            'cart_items' => $cart_items,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    error_log("Order Creation Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if ($order_items_stmt instanceof mysqli_stmt) {
        $order_items_stmt->close();
    }
    if ($stock_movement_stmt instanceof mysqli_stmt) {
        $stock_movement_stmt->close();
    }
    $conn->close();
}
?>
