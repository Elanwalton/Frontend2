<?php
// api/verify-email.php
require_once __DIR__ . '/ApiHelper.php';
require 'RateLimiter.php';

$conn = getDbConnection();

// Initialize rate limiter
$rateLimiter = new RateLimiter($conn);
$clientIp = RateLimiter::getClientIp();

// Check rate limit: 5 attempts per hour per IP
$rateCheck = $rateLimiter->checkLimit($clientIp, 5, 3600);

if (!$rateCheck['allowed']) {
    http_response_code(429); // Too Many Requests
    echo json_encode([
        "success" => false,
        "message" => "Too many verification attempts. Please try again later.",
        "retry_after" => $rateCheck['reset_at']
    ]);
    exit;
}

// Debug: Log the request
error_log("Verify email request - Token: " . ($token ?? 'none'));
error_log("GET parameters: " . print_r($_GET, true));
error_log("Request URI: " . $_SERVER['REQUEST_URI'] ?? 'none');
error_log("Rate limit check - Attempts: " . $rateCheck['attempts'] . ", Remaining: " . $rateCheck['remaining']);

// Check if token exists
if (!isset($_GET['token']) || empty(trim($_GET['token']))) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Verification token is required"]);
    exit;
}

$token = trim($_GET['token']);

// Start transaction
$conn->begin_transaction();

try {
    // Get the token with user info
    $sql = "SELECT u.id, u.email, u.first_name, u.is_verified, 
                   vt.token, vt.expires_at, vt.is_used
            FROM verification_tokens vt
            JOIN users u ON vt.user_id = u.id
            WHERE vt.token = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Invalid verification token.");
    }
    
    $data = $result->fetch_assoc();
    
    // Check if already verified
    if ($data['is_verified']) {
        throw new Exception("Email has already been verified.");
    }
    
    // Check if token is already used
    if ($data['is_used']) {
        throw new Exception("This verification link has already been used.");
    }
    
    // Check if token is expired
    $now = new DateTime();
    $expiresAt = new DateTime($data['expires_at']);
    
    if ($now > $expiresAt) {
        throw new Exception("Verification link has expired. Please request a new one.");
    }
    
    // Mark user as verified
    $updateUserSql = "UPDATE users SET is_verified = 1 WHERE id = ?";
    $updateUserStmt = $conn->prepare($updateUserSql);
    $updateUserStmt->bind_param("i", $data['id']);
    
    if (!$updateUserStmt->execute()) {
        throw new Exception("Failed to verify email. Please try again.");
    }
    
    // Mark token as used
    $updateTokenSql = "UPDATE verification_tokens SET is_used = 1 WHERE token = ?";
    $updateTokenStmt = $conn->prepare($updateTokenSql);
    $updateTokenStmt->bind_param("s", $token);
    
    if (!$updateTokenStmt->execute()) {
        throw new Exception("Failed to update verification status.");
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return JSON success response
    echo json_encode([
        "success" => true,
        "message" => "Email verified successfully!",
        "email" => $data['email']
    ]);
    exit;
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    // Return JSON error response
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
} finally {
    // Close statements
    if (isset($stmt)) $stmt->close();
    if (isset($updateUserStmt)) $updateUserStmt->close();
    if (isset($updateTokenStmt)) $updateTokenStmt->close();
    $conn->close();
}