<?php
// api/mpesa-callback.php
require_once __DIR__ . '/../ApiHelper.php';
$conn = getDbConnection();

header('Content-Type: application/json');

// Log the incoming callback for debugging
file_put_contents('mpesa_callback.log', date('Y-m-d H:i:s') . " - " . file_get_contents('php://input') . "\n", FILE_APPEND);

// Get the callback data
$callback_data = json_decode(file_get_contents('php://input'), true);

if (!$callback_data) {
    error_log("Invalid M-Pesa callback data received");
    http_response_code(400);
    echo json_encode(["ResultCode" => 1, "ResultDesc" => "Invalid data format"]);
    exit;
}

try {
    // Extract the relevant callback data
    $stk_callback = $callback_data['Body']['stkCallback'] ?? [];
    $checkout_request_id = $stk_callback['CheckoutRequestID'] ?? '';
    $merchant_request_id = $stk_callback['MerchantRequestID'] ?? '';
    $result_code = $stk_callback['ResultCode'] ?? '';
    $result_desc = $stk_callback['ResultDesc'] ?? '';
    
    // Get callback metadata
    $callback_metadata = $stk_callback['CallbackMetadata']['Item'] ?? [];
    $mpesa_receipt_number = '';
    $amount = 0;
    $phone_number = '';
    $transaction_date = '';
    
    foreach ($callback_metadata as $item) {
        switch ($item['Name']) {
            case 'MpesaReceiptNumber':
                $mpesa_receipt_number = $item['Value'] ?? '';
                break;
            case 'Amount':
                $amount = $item['Value'] ?? 0;
                break;
            case 'PhoneNumber':
                $phone_number = $item['Value'] ?? '';
                break;
            case 'TransactionDate':
                $transaction_date = $item['Value'] ?? '';
                break;
        }
    }
    
    // Find the payment record
    $sql = "SELECT * FROM payments WHERE checkout_request_id = ? OR merchant_request_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $checkout_request_id, $merchant_request_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        error_log("Payment record not found for CheckoutRequestID: $checkout_request_id");
        echo json_encode(["ResultCode" => 1, "ResultDesc" => "Payment record not found"]);
        exit;
    }
    
    $payment = $result->fetch_assoc();
    
    // Update payment record based on result
    $status = ($result_code === '0') ? 'success' : 'failed';
    $processed_at = date('Y-m-d H:i:s');
    
    $update_sql = "UPDATE payments SET 
        status = ?, 
        result_code = ?, 
        result_desc = ?, 
        mpesa_receipt_number = ?, 
        raw_callback = ?, 
        processed_at = ?, 
        updated_at = NOW() 
        WHERE id = ?";
    
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param(
        "ssssssi",
        $status,
        $result_code,
        $result_desc,
        $mpesa_receipt_number,
        json_encode($callback_data),
        $processed_at,
        $payment['id']
    );
    
    if (!$update_stmt->execute()) {
        throw new Exception("Failed to update payment record");
    }
    
    $update_stmt->close();
    $stmt->close();
    
    // If payment was successful, you might want to:
    // 1. Update order status
    // 2. Send confirmation email to customer
    // 3. Trigger any post-payment workflows
    
    if ($result_code === '0') {
        // Payment successful - update order status
        $order_update_sql = "UPDATE orders SET status = 'paid', payment_status = 'completed', updated_at = NOW() WHERE id = ?";
        $order_stmt = $conn->prepare($order_update_sql);
        $order_stmt->bind_param("i", $payment['order_id']);
        $order_stmt->execute();
        $order_stmt->close();
        
        // Log successful payment
        error_log("M-Pesa payment successful: Receipt $mpesa_receipt_number, Amount $amount, Order ID {$payment['order_id']}");
        
        // You could also send a confirmation email here
        // sendPaymentConfirmationEmail($payment['customer_email'], $payment['order_id'], $mpesa_receipt_number, $amount);
        
    } else {
        // Payment failed
        error_log("M-Pesa payment failed: $result_desc, Order ID {$payment['order_id']}");
    }
    
    // Return success response to M-Pesa
    echo json_encode(["ResultCode" => 0, "ResultDesc" => "Callback processed successfully"]);
    
} catch (Exception $e) {
    error_log("M-Pesa Callback Error: " . $e->getMessage());
    
    echo json_encode(["ResultCode" => 1, "ResultDesc" => "Internal server error"]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($update_stmt)) $update_stmt->close();
    if (isset($order_stmt)) $order_stmt->close();
    $conn->close();
}
?>
