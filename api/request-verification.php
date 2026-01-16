<?php
// api/request-verification.php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

// Load PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Check if user exists and is not verified
    $sql = "SELECT id, first_name, is_verified FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("No account found with this email.");
    }
    
    $user = $result->fetch_assoc();
    
    if ($user['is_verified']) {
        throw new Exception("This email is already verified. Please log in.");
    }
    
    // Generate new verification token
    $verificationToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Delete any existing tokens for this user
    $deleteSql = "DELETE FROM verification_tokens WHERE user_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $user['id']);
    $deleteStmt->execute();
    
    // Insert new token
    $tokenSql = "INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $tokenStmt = $conn->prepare($tokenSql);
    $tokenStmt->bind_param("iss", $user['id'], $verificationToken, $expiresAt);
    
    if (!$tokenStmt->execute()) {
        throw new Exception("Failed to generate verification token.");
    }
    
    // Send verification email using the same email system as other endpoints
    if (file_exists('send-mail-smtp.php')) {
        require 'send-mail-smtp.php';
        $baseUrl = $_ENV['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
        $verificationLink = $baseUrl . "/verify-email?token=" . $verificationToken;
        $mailSent = sendVerificationEmailSMTP($email, $user['first_name'], $verificationLink);
        
        if (!$mailSent) {
            error_log("Failed to send verification email to: " . $email);
            // Don't fail the request - user can try again
        }
    } else {
        error_log("send-mail-smtp.php not found");
    }
    
    $conn->commit();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Verification email sent. Please check your inbox."
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
    if (isset($deleteStmt)) $deleteStmt->close();
    if (isset($tokenStmt)) $tokenStmt->close();
    $conn->close();
}
?>
