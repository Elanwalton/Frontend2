<?php
// Start output buffering to catch any errors
ob_start();

// Set error handler to catch all errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $errstr
    ]);
    exit;
});

// Set exception handler
set_exception_handler(function($exception) {
    error_log("PHP Exception: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $exception->getMessage()
    ]);
    exit;
});

// ---------------------------
//  CORS HEADERS (centralized)
// ---------------------------
require __DIR__ . '/cors.php';
require 'connection.php';
require 'mail-config.php';
require 'PasswordValidator.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Turn off error display for API endpoints
ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

// Clear any buffered output from includes
ob_clean();

// ---------------------------
//  Get and Decode JSON
// ---------------------------
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Debug: Log what we received
error_log("=== SignUp Request ===");
error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log("Content-Length: " . ($_SERVER['CONTENT_LENGTH'] ?? 'not set'));
error_log("Raw input length: " . strlen($input));
error_log("Raw input: " . $input);
error_log("Decoded data: " . print_r($data, true));
error_log("=== End SignUp Request ===");

if (!$data) {
    http_response_code(400);
    echo json_encode([
        "message" => "Invalid or missing JSON input.",
        "raw_input" => $input,
        "content_type" => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        "content_length" => $_SERVER['CONTENT_LENGTH'] ?? 'not set'
    ]);
    exit;
}

$first_name = trim($data["firstName"] ?? '');
$second_name = trim($data["secondName"] ?? '');
$email = trim($data["email"] ?? '');
$password = $data["password"] ?? '';

if (empty($first_name) || empty($second_name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["message" => "All fields are required."]);
    exit;
}

// ---------------------------
//  Validate password strength
// ---------------------------
$passwordValidation = PasswordValidator::validate($password);
if (!$passwordValidation['valid']) {
    http_response_code(400);
    echo json_encode([
        "message" => "Password does not meet requirements.",
        "errors" => $passwordValidation['errors']
    ]);
    exit;
}

// ---------------------------
//  Validate email format
// ---------------------------
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email format."]);
    exit;
}

// ---------------------------
//  Check for duplicate email
// ---------------------------
$checkSql = "SELECT * FROM users WHERE email = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["message" => "Email already exists."]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // ---------------------------
    //  Insert user into DB
    // ---------------------------
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (first_name, second_name, email, password, is_verified) VALUES (?, ?, ?, ?, 0)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $first_name, $second_name, $email, $hashedPassword);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to create user account.");
    }
    
    $userId = $conn->insert_id;
    
    // ---------------------------
    //  Generate verification token
    // ---------------------------
    $verificationToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    $tokenSql = "INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $tokenStmt = $conn->prepare($tokenSql);
    $tokenStmt->bind_param("iss", $userId, $verificationToken, $expiresAt);
    
    if (!$tokenStmt->execute()) {
        throw new Exception("Failed to generate verification token.");
    }
    
    // ---------------------------
    //  Send verification email
    // ---------------------------
    // Use localhost:3000 for development (change to your domain in production)
    $verificationLink = "http://localhost:3000/verify-email?token=" . $verificationToken;
    
    // Log the verification link for development
    error_log("Verification link: " . $verificationLink);
    
    try {
        if (file_exists('send-mail-smtp.php')) {
            require 'send-mail-smtp.php';
            $mailSent = sendVerificationEmailSMTP($email, $first_name, $verificationLink);
            
            if (!$mailSent) {
                error_log("Failed to send verification email to: " . $email);
                // Don't fail the registration - user can request resend
            }
        } else {
            error_log("send-mail-smtp.php not found");
        }
    } catch (Exception $mailError) {
        error_log("Email sending error: " . $mailError->getMessage());
        // Don't fail the registration - user can request resend
    }
    
    // Commit the transaction
    $conn->commit();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful! Please check your email to verify your account.",
        "requiresVerification" => true
    ]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    // Close statements
    if (isset($stmt)) $stmt->close();
    if (isset($tokenStmt)) $tokenStmt->close();
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($conn)) $conn->close();
}