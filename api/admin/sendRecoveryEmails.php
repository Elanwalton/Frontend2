<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';
require_once __DIR__ . '/../send-mail-smtp.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    sendError(401, 'Unauthorized');
}

if (($auth['role'] ?? '') !== 'admin') {
    sendError(403, 'Forbidden');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

try {
    // Find abandoned orders:
    // 1. Status is 'pending'
    // 2. Created more than 1 hour ago
    // 3. Created less than 7 days ago (to avoid spamming very old carts)
    // 4. Has customer email
    $query = "
        SELECT 
            id, 
            order_number, 
            customer_name, 
            customer_email 
        FROM orders 
        WHERE status = 'pending' 
        AND created_at <= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND customer_email IS NOT NULL 
        AND customer_email != ''
        LIMIT 50
    ";

    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception($conn->error);
    }

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    $sentCount = 0;
    $failedCount = 0;
    $errors = [];

    // Base URL for cart recovery (adjust logic if you have a specific token based recovery)
    // Assuming user just goes to cart or checkout
    $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'https://sunleaftechnologies.co.ke';
    $cartUrl = rtrim($frontendUrl, '/') . '/cart';

    foreach ($orders as $order) {
        $name = $order['customer_name'] ?: 'Valued Customer';
        $email = $order['customer_email'];
        
        // In a real system, checking if an email was ALREADY sent is crucial.
        // For now, we assume this action is triggered manually and carefully.
        // Optionally, we could check a 'recovery_email_sent_at' column if we added one.

        $success = sendCartRecoveryEmailSMTP($email, $name, $cartUrl);

        if ($success) {
            $sentCount++;
        } else {
            $failedCount++;
            $errors[] = "Failed to send to $email ({$order['order_number']})";
        }
    }

    sendSuccess([
        'message' => "Process complete",
        'found' => count($orders),
        'sent' => $sentCount,
        'failed' => $failedCount,
        'errors' => $errors
    ]);

} catch (Exception $e) {
    error_log('sendRecoveryEmails error: ' . $e->getMessage());
    sendError(500, 'Failed to process recovery emails: ' . $e->getMessage());
}
?>
