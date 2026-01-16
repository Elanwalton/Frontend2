<?php
// api/mpesa-status.php
require_once __DIR__ . '/../ApiHelper.php';
$conn = getDbConnection();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// GET request to check payment status
$payment_id = $_GET['payment_id'] ?? '';
$checkout_request_id = $_GET['checkout_request_id'] ?? '';

if (empty($payment_id) && empty($checkout_request_id)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Payment ID or Checkout Request ID is required."
    ]);
    exit;
}

try {
    // Find payment record
    if (!empty($payment_id)) {
        $sql = "SELECT * FROM payments WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $payment_id);
    } else {
        $sql = "SELECT * FROM payments WHERE checkout_request_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $checkout_request_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Payment record not found."
        ]);
        exit;
    }
    
    $payment = $result->fetch_assoc();
    $stmt->close();
    
    // Return payment status
    echo json_encode([
        "success" => true,
        "data" => [
            "payment_id" => $payment['id'],
            "checkout_request_id" => $payment['checkout_request_id'],
            "merchant_request_id" => $payment['merchant_request_id'],
            "order_id" => $payment['order_id'],
            "user_id" => $payment['user_id'],
            "amount" => $payment['amount'],
            "currency" => $payment['currency'],
            "payment_method" => $payment['payment_method'],
            "status" => $payment['status'],
            "result_code" => $payment['result_code'],
            "result_desc" => $payment['result_desc'],
            "mpesa_receipt_number" => $payment['mpesa_receipt_number'],
            "customer_email" => $payment['customer_email'],
            "customer_name" => $payment['customer_name'],
            "phone_number" => $payment['phone_number'],
            "processed_at" => $payment['processed_at'],
            "transaction_date" => $payment['transaction_date'],
            "created_at" => $payment['created_at'],
            "updated_at" => $payment['updated_at']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("M-Pesa Status Check Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while checking payment status."
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>
