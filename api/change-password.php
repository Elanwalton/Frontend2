<?php
require_once __DIR__ . '/auth-middleware.php'; // Defines $GLOBALS['_AUTH_USER'] and handles unauthorized exit

$conn = getDbConnection();

// Set JSON response header
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get User ID from global set by middleware
$userId = $GLOBALS['_AUTH_USER']['id'] ?? 0;

if ($userId <= 0) {
    // Should already be handled by auth-middleware, but as a safeguard
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['current_password', 'new_password', 'confirm_password'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => str_replace('_', ' ', ucfirst($field)) . " is required"]);
        exit;
    }
}

$currentPassword = $input['current_password'];
$newPassword = $input['new_password'];
$confirmPassword = $input['confirm_password'];

// Validate new password
if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New passwords do not match']);
    exit;
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
    exit;
}

// Get current user password
$sql = "SELECT password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user = $result->fetch_assoc();

// Verify current password
if (!password_verify($currentPassword, $user['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
    exit;
}

// Hash new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password
$updateSql = "UPDATE users SET password = ? WHERE id = ?";
$stmt = $conn->prepare($updateSql);
$stmt->bind_param("si", $hashedPassword, $userId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to change password']);
}

$stmt->close();
$conn->close();
?>
