<?php
// api/mpesa-stkpush.php - Production-ready version

require_once __DIR__ . '/../ApiHelper.php';
$conn = getDbConnection();
require 'mpesa-config.php';

header('Content-Type: application/json');

// Allow preflight OPTIONS request for CORS, no content needed
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Function to send JSON response and exit
function sendResponse(int $code, bool $success, string $message, array $data = []) {
    http_response_code($code);
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message,
    ], $data));
    exit;
}

// Validate and sanitize input data
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    sendResponse(400, false, 'Invalid JSON input.');
}

$phone_number = $input['phone_number'] ?? '';
$amount = $input['amount'] ?? '';
$order_id = $input['order_id'] ?? '';
$user_id = $input['user_id'] ?? '';
$customer_email = $input['customer_email'] ?? '';
$customer_name = $input['customer_name'] ?? '';

// Basic input validation
if (empty($phone_number) || empty($amount) || empty($order_id) || empty($user_id)) {
    sendResponse(400, false, "Phone number, amount, order ID, and user ID are required.");
}

// Sanitize phone number: remove all non-digits
$phone_number = preg_replace('/\D/', '', $phone_number);

// Normalize phone number format to 254XXXXXXXXX
if (strlen($phone_number) === 10 && $phone_number[0] === '0') {
    $phone_number = '254' . substr($phone_number, 1);
} elseif (strlen($phone_number) !== 12 || substr($phone_number, 0, 3) !== '254') {
    sendResponse(400, false, "Invalid phone number format. Use 254XXXXXXXXX or 07XXXXXXXX format.");
}

$conn->begin_transaction();

try {
    MpesaConfig::init();

    $config = MpesaConfig::getConfig();
    $timestamp = MpesaConfig::getTimestamp();
    $password = MpesaConfig::generatePassword($config['shortcode'], $config['passkey'], $timestamp);

    // Obtain OAuth token
    $ch = curl_init($config['oauth_url']);
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($config['consumer_key'] . ':' . $config['consumer_secret'])
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => false,
    ]);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        throw new RuntimeException("OAuth token request failed with HTTP code $http_code");
    }

    $token_data = json_decode($response, true);
    if (empty($token_data['access_token'])) {
        throw new RuntimeException("OAuth token response missing access_token");
    }
    $access_token = $token_data['access_token'];

    // Prepare unique IDs
    $checkout_request_id = uniqid('mpesa_', true);
    $merchant_request_id = uniqid('merchant_', true);
    $notes = "STK Push initiated";

    // Insert payment record - prepared statement
    $sql = "INSERT INTO payments (
        checkout_request_id, 
        merchant_request_id, 
        order_id, 
        user_id, 
        amount, 
        currency, 
        payment_method, 
        status, 
        customer_email, 
        customer_name, 
        phone_number, 
        notes, 
        transaction_date,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, 'KES', 'mpesa', 'pending', ?, ?, ?, ?, NOW(), NOW(), NOW())";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new RuntimeException("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param(
        "sssidssss",
        $checkout_request_id,
        $merchant_request_id,
        $order_id,
        $user_id,
        $amount,
        $customer_email,
        $customer_name,
        $phone_number,
        $notes
    );
    if (!$stmt->execute()) {
        throw new RuntimeException("Failed to create payment record: " . $stmt->error);
    }
    $payment_id = $conn->insert_id;
    $stmt->close();

    // Prepare STK Push request
    $stk_push_data = [
        'BusinessShortCode' => $config['shortcode'],
        'Password' => $password,
        'Timestamp' => $timestamp,
        'TransactionType' => 'CustomerPayBillOnline',
        'Amount' => (int)$amount,
        'PartyA' => $phone_number,
        'PartyB' => $config['shortcode'],
        'PhoneNumber' => $phone_number,
        'CallBackURL' => MpesaConfig::$callback_url,
        'AccountReference' => $order_id,
        'TransactionDesc' => "Payment for order #$order_id",
        'Remark' => 'Payment'
    ];

    $ch = curl_init($config['stkpush_url']);
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $access_token
        ],
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($stk_push_data),
        CURLOPT_RETURNTRANSFER => true,
    ]);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = $response === false ? curl_error($ch) : '';
    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException("STK Push request failed: " . ($curl_error ?: 'Unknown cURL error'));
    }
    if ($http_code !== 200) {
        throw new RuntimeException("STK Push failed with HTTP code $http_code: $response");
    }

    $stk_response = json_decode($response, true);
    if (!is_array($stk_response)) {
        throw new RuntimeException("Invalid JSON response from STK Push");
    }

    $gateway_response_json = json_encode($stk_response);

    if (isset($stk_response['ResponseCode']) && $stk_response['ResponseCode'] === '0') {
        // Success - update payment record with response data
        $update_sql = "UPDATE payments SET 
            checkout_request_id = ?, 
            merchant_request_id = ?, 
            gateway_response = ?, 
            updated_at = NOW() 
            WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            throw new RuntimeException("Prepare failed: " . $conn->error);
        }
        $update_stmt->bind_param(
            "sssi",
            $stk_response['CheckoutRequestID'],
            $stk_response['MerchantRequestID'],
            $gateway_response_json,
            $payment_id
        );
        if (!$update_stmt->execute()) {
            throw new RuntimeException("Failed to update payment record: " . $update_stmt->error);
        }
        $update_stmt->close();

        $conn->commit();

        sendResponse(200, true, "STK Push initiated successfully. Please check your phone for the M-Pesa prompt.", [
            "data" => [
                "checkout_request_id" => $stk_response['CheckoutRequestID'],
                "merchant_request_id" => $stk_response['MerchantRequestID'],
                "payment_id" => $payment_id,
                "phone_number" => $phone_number,
                "amount" => $amount
            ]
        ]);
    } else {
        // Failure - update payment status and save error info
        $error_message = $stk_response['errorMessage'] ?? 'Unknown error occurred';
        $response_code = $stk_response['ResponseCode'] ?? '999';

        $update_sql = "UPDATE payments SET 
            status = 'failed', 
            result_code = ?, 
            result_desc = ?, 
            gateway_response = ?, 
            updated_at = NOW() 
            WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        if (!$update_stmt) {
            throw new RuntimeException("Prepare failed: " . $conn->error);
        }
        $update_stmt->bind_param(
            "sssi",
            $response_code,
            $error_message,
            $gateway_response_json,
            $payment_id
        );
        if (!$update_stmt->execute()) {
            throw new RuntimeException("Failed to update failed payment record: " . $update_stmt->error);
        }
        $update_stmt->close();

        $conn->commit();

        throw new RuntimeException("STK Push failed: " . $error_message);
    }

} catch (Throwable $e) {
    $conn->rollback();

    // Log detailed error on server logs (do NOT leak sensitive info to client)
    error_log("[M-Pesa STK Push Error] " . $e->getMessage());

    // Respond with generic error message to client
    sendResponse(500, false, "An internal server error occurred while processing your payment. Please try again later.");
} finally {
    $conn->close();
}
