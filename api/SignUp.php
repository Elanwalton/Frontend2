<?php
// Production-ready version
require_once __DIR__ . '/ApiHelper.php';
require 'SignUpRateLimiter.php';
require 'PasswordValidator.php';

$conn = getDbConnection();

try {
    error_log("=== Production SignUp Started ===");
    
    // Rate limiting check
    $clientIp = $_SERVER['REMOTE_ADDR'];
    $rateLimiter = new SignUpRateLimiter($conn);
    
    if (!$rateLimiter->isAllowed($clientIp)) {
        $remainingTime = $rateLimiter->getRemainingTime($clientIp);
        $minutes = ceil($remainingTime / 60);
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "message" => "Please wait $minutes minutes before attempting to sign up again."
        ]);
        exit;
    }
    
    // Record this attempt
    $rateLimiter->recordAttempt($clientIp);
    
    // Get and decode JSON
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid JSON input"]);
        exit;
    }
    
    $first_name = trim($data["firstName"] ?? '');
    $second_name = trim($data["secondName"] ?? '');
    $email = trim($data["email"] ?? '');
    $password = $data["password"] ?? '';
    
    error_log("Received data: " . print_r($data, true));
    
    // Basic validation
    if (empty($first_name) || empty($second_name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "All fields are required"]);
        exit;
    }
    
    // Password strength validation
    $passwordValidation = PasswordValidator::validate($password);
    if (!$passwordValidation['valid']) {
        http_response_code(400);
        echo json_encode([
            "message" => "Password does not meet requirements.",
            "errors" => $passwordValidation['errors']
        ]);
        exit;
    }
    
    // Check for duplicate email
    $checkSql = "SELECT * FROM users WHERE email = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email already exists"]);
        exit;
    }
    
    // Insert user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (first_name, second_name, email, password, role, is_verified) VALUES (?, ?, ?, ?, 'client', 0)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $first_name, $second_name, $email, $hashedPassword);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to create user account");
    }
    
    $userId = $conn->insert_id;
    error_log("User created with ID: " . $userId);
    
    // Generate verification token
    $verificationToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    $tokenSql = "INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $tokenStmt = $conn->prepare($tokenSql);
    $tokenStmt->bind_param("iss", $userId, $verificationToken, $expiresAt);
    
    if (!$tokenStmt->execute()) {
        throw new Exception("Failed to generate verification token");
    }
    
    error_log("Verification token created");
    
    // Send verification email with dynamic domain
    $baseUrl = $_ENV['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
    $verificationLink = $baseUrl . "/verify-email?token=" . $verificationToken;
    error_log("Verification link: " . $verificationLink);
    
    try {
        if (file_exists('send-mail-smtp.php')) {
            require 'send-mail-smtp.php';
            $mailSent = sendVerificationEmailSMTP($email, $first_name, $verificationLink);
            
            if (!$mailSent) {
                error_log("Failed to send verification email to: " . $email);
                // Don't fail registration - user can request resend
            }
        } else {
            error_log("send-mail-smtp.php not found");
        }
    } catch (Exception $mailError) {
        error_log("Email sending error: " . $mailError->getMessage());
        // Don't fail registration - user can request resend
    }
    
    // Close statements
    $checkStmt->close();
    $stmt->close();
    $tokenStmt->close();
    $conn->close();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful! Please check your email to verify your account.",
        "requiresVerification" => true
    ]);
    
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
