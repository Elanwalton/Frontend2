<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

$token = $_GET['token'] ?? '';

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    exit;
}

$currentTime = time();

// Check if token exists in database
$sql = "SELECT * FROM session_tokens WHERE token = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false, 
        'message' => 'Token not found in database',
        'token_provided' => substr($token, 0, 8) . '...',
        'current_time' => $currentTime
    ]);
    exit;
}

$session = $result->fetch_assoc();

echo json_encode([
    'success' => true,
    'message' => 'Token found',
    'token_provided' => substr($token, 0, 8) . '...',
    'token_data' => [
        'user_id' => $session['user_id'],
        'email' => $session['email'],
        'role' => $session['role'],
        'expires_at' => $session['expires_at'],
        'created_at' => $session['created_at']
    ],
    'current_time' => $currentTime,
    'is_expired' => $session['expires_at'] <= $currentTime,
    'time_until_expiry' => $session['expires_at'] - $currentTime,
    'hours_until_expiry' => round(($session['expires_at'] - $currentTime) / 3600, 2)
]);

?>
