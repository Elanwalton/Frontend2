<?php
// api/resend-verification.php
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
    echo json_encode(["message" => "Email is required."]);
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
    
    // Send verification email
    // Use the same Next.js verification page URL as SignUp.php
    $verificationLink = getFrontendUrl() . "/verify-email?token=" . $verificationToken;
    $to = $email;
    $subject = "Verify Your Email Address";
    $message = "
    <html>
    <head>
        <title>Verify Your Email Address</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button {
                display: inline-block; 
                padding: 10px 20px; 
                margin: 20px 0; 
                background-color: #10b981; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
            }
            .footer { 
                margin-top: 30px; 
                font-size: 12px; 
                color: #666; 
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Verify Your Email Address</h2>
            <p>Hello {$user['first_name']},</p>
            <p>We've received a request to verify your email address. Please click the button below to complete the verification:</p>
            <p>
                <a href='$verificationLink' class='button'>Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href='$verificationLink'>$verificationLink</a></p>
            <p>This link will expire in 24 hours.</p>
            <div class='footer'>
                <p>If you didn't request this email, you can safely ignore it.</p>
                <p>© " . date('Y') . " Sunleaf Tech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Send verification email using PHPMailer
    $mail = new PHPMailer(true);
    
    try {
        // Server settings (from environment)
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 587);
        
        // Recipients
        $fromEmail = $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@sunleaftechnologies.co.ke';
        $fromName  = $_ENV['MAIL_FROM_NAME'] ?? 'Sunleaf Tech';
        $replyTo   = $_ENV['MAIL_REPLY_TO_EMAIL'] ?? 'support@sunleaftechnologies.co.ke';
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($email);
        $mail->addReplyTo($replyTo, $fromName . ' Support');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;
        
        $mail->send();
        
    } catch (Exception $e) {
        throw new Exception("Failed to send verification email: " . $mail->ErrorInfo);
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