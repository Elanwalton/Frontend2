<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

$conn->begin_transaction();

try {
    // Check if user exists
    $sql = "SELECT id, first_name FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Don't reveal if email exists (security best practice)
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "If an account exists with this email, you will receive a password reset link."
        ]);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Delete any existing reset tokens for this user
    $deleteSql = "DELETE FROM password_reset_tokens WHERE user_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $user['id']);
    $deleteStmt->execute();
    
    // Insert new reset token
    $tokenSql = "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $tokenStmt = $conn->prepare($tokenSql);
    $tokenStmt->bind_param("iss", $user['id'], $resetToken, $expiresAt);
    
    error_log("About to insert reset token for user ID: " . $user['id']);
    error_log("Token: " . $resetToken);
    error_log("Expires: " . $expiresAt);
    
    if (!$tokenStmt->execute()) {
        error_log("Failed to insert reset token: " . $tokenStmt->error);
        throw new Exception("Failed to generate reset token.");
    }
    
    error_log("Reset token inserted successfully. Token ID: " . $conn->insert_id);
    
    // Send reset email with dynamic domain
    $baseUrl = $_ENV['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
    $resetLink = $baseUrl . "/reset-password?token=" . $resetToken;
    
    try {
        require 'send-mail-smtp.php';
        $mailSent = sendPasswordResetEmailSMTP($email, $user['first_name'], $resetLink);
        
        if (!$mailSent) {
            error_log("Failed to send password reset email to: " . $email);
            throw new Exception("Failed to send reset email");
        }
        
    } catch (Exception $mailError) {
        error_log("Email sending error: " . $mailError->getMessage());
        throw new Exception("Failed to send reset email: " . $mailError->getMessage());
    }
    
    $conn->commit();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "If an account exists with this email, you will receive a password reset link."
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("Forgot password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later."
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($deleteStmt)) $deleteStmt->close();
    if (isset($tokenStmt)) $tokenStmt->close();
    $conn->close();
}
?>
