<?php
require __DIR__ . '/cors.php';
require 'connection.php';
require 'session-config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get session token from Authorization header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    exit;
}

// Validate token
$tokenSql = "SELECT * FROM session_tokens WHERE token = ? AND expires_at > ?";
$stmt = $conn->prepare($tokenSql);
$currentTime = time();
$stmt->bind_param("si", $token, $currentTime);
$stmt->execute();
$tokenResult = $stmt->get_result();

if ($tokenResult->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
    exit;
}

$sessionData = $tokenResult->fetch_assoc();
$userId = $sessionData['user_id'];

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['first_name', 'second_name', 'email'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "$field is required"]);
        exit;
    }
}

$firstName = trim($input['first_name']);
$secondName = trim($input['second_name']);
$email = trim($input['email']);
$phone = trim($input['phone'] ?? '');
$gender = trim($input['gender'] ?? '');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Check if email is already used by another user
$checkEmailSql = "SELECT id FROM users WHERE email = ? AND id != ?";
$stmt = $conn->prepare($checkEmailSql);
$stmt->bind_param("si", $email, $userId);
$stmt->execute();
$emailCheck = $stmt->get_result();

if ($emailCheck->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is already in use by another account']);
    exit;
}

// Update user profile
$updateSql = "UPDATE users SET first_name = ?, second_name = ?, email = ?, phone = ?, gender = ? WHERE id = ?";
$stmt = $conn->prepare($updateSql);
$stmt->bind_param("sssssi", $firstName, $secondName, $email, $phone, $gender, $userId);

if ($stmt->execute()) {
    // Update session token with new email
    $updateTokenSql = "UPDATE session_tokens SET email = ? WHERE token = ?";
    $stmt = $conn->prepare($updateTokenSql);
    $stmt->bind_param("ss", $email, $token);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => $userId,
            'first_name' => $firstName,
            'second_name' => $secondName,
            'email' => $email,
            'phone' => $phone,
            'gender' => $gender,
            'role' => $sessionData['role']
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}

$stmt->close();
$conn->close();
?>
