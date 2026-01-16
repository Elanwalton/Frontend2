<?php
require_once __DIR__ . '/ApiHelper.php';
require 'PasswordValidator.php';

$conn = getDbConnection();

$input = json_decode(file_get_contents('php://input'), true);
$token = trim($input['token'] ?? '');
$newPassword = $input['password'] ?? '';
$confirmPassword = $input['confirmPassword'] ?? '';

if (empty($token) || empty($newPassword) || empty($confirmPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Passwords do not match."]);
    exit;
}

// Validate password strength
$passwordValidation = PasswordValidator::validate($newPassword);
if (!$passwordValidation['valid']) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password does not meet requirements.",
        "errors" => $passwordValidation['errors']
    ]);
    exit;
}

$conn->begin_transaction();

try {
    // Get the token with user info
    $sql = "SELECT u.id, u.email, prt.token, prt.expires_at
            FROM password_reset_tokens prt
            JOIN users u ON prt.user_id = u.id
            WHERE prt.token = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Invalid reset token.");
    }
    
    $data = $result->fetch_assoc();
    
    // Check if token is expired
    $now = new DateTime();
    $expiresAt = new DateTime($data['expires_at']);
    
    if ($now > $expiresAt) {
        throw new Exception("Reset link has expired. Please request a new one.");
    }
    
    // Update user password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateSql = "UPDATE users SET password = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("si", $hashedPassword, $data['id']);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Failed to reset password. Please try again.");
    }
    
    // Delete the reset token
    $deleteSql = "DELETE FROM password_reset_tokens WHERE token = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("s", $token);
    $deleteStmt->execute();
    
    $conn->commit();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Password reset successfully! You can now login with your new password."
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    if (isset($deleteStmt)) $deleteStmt->close();
    $conn->close();
}
?>
