<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();
$token = getAuthToken();
$userData = validateToken($conn, $token);
$userId = $userData['user_id'];

// Get notifications for the user (placeholder - returns empty for now)
$notifications = [
    [
        'id' => 1,
        'message' => 'New order received',
        'type' => 'order',
        'read' => false,
        'created_at' => date('Y-m-d H:i:s')
    ]
];

echo json_encode([
    'success' => true,
    'notifications' => $notifications,
    'count' => count($notifications)
]);

?>
