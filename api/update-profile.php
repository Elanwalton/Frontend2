<?php
/**
 * update-profile.php
 * Client profile update endpoint
 */

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
    error_log('Token validation error in update-profile.php: ' . $e->getMessage());
    sendError(401, 'Unauthorized');
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

// Get request body
$input = getJsonInput();

try {
    $conn->begin_transaction();
    
    // Validate required fields
    if (empty($input['first_name']) || empty($input['email'])) {
        throw new Exception('First name and email are required');
    }
    
    // Prepare update fields
    $updateFields = [];
    $params = [];
    $types = '';
    
    // First name (required)
    $updateFields[] = "first_name = ?";
    $params[] = trim($input['first_name']);
    $types .= 's';
    
    // Second name (optional)
    if (isset($input['second_name'])) {
        $updateFields[] = "second_name = ?";
        $params[] = trim($input['second_name']);
        $types .= 's';
    }
    
    // Email (required, check for uniqueness)
    $email = trim($input['email']);
    $checkEmailStmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $checkEmailStmt->bind_param('si', $email, $userId);
    $checkEmailStmt->execute();
    if ($checkEmailStmt->get_result()->num_rows > 0) {
        throw new Exception('Email address is already in use');
    }
    
    $updateFields[] = "email = ?";
    $params[] = $email;
    $types .= 's';
    
    // Phone (optional)
    if (isset($input['phone'])) {
        $updateFields[] = "phone = ?";
        $params[] = trim($input['phone']);
        $types .= 's';
    }
    
    // Profile picture (optional)
    if (isset($input['profile_picture'])) {
        $updateFields[] = "profile_picture = ?";
        $params[] = trim($input['profile_picture']);
        $types .= 's';
    }
    
    // Build and execute update query
    $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $params[] = $userId;
    $types .= 'i';
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception('Failed to prepare update statement');
    }
    
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        // No changes made, but not an error
        $conn->commit();
        sendSuccess(['message' => 'No changes were made']);
    }
    
    $conn->commit();
    
    // Fetch updated user data
    $userStmt = $conn->prepare("SELECT id, email, first_name, second_name, phone, profile_picture, role FROM users WHERE id = ?");
    $userStmt->bind_param('i', $userId);
    $userStmt->execute();
    $result = $userStmt->get_result();
    $user = $result->fetch_assoc();
    
    sendSuccess([
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => (int)$user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'second_name' => $user['second_name'],
            'phone' => $user['phone'],
            'profile_picture' => $user['profile_picture'],
            'role' => $user['role']
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    error_log('Profile update error: ' . $e->getMessage());
    sendError(400, $e->getMessage());
}

$conn->close();
