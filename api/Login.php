<?php
// api/Login.php
require_once __DIR__ . '/ApiHelper.php';
require 'LoginRateLimiter.php';
require 'session-config.php';

$conn = getDbConnection();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit;
}

try {
    // Initialize rate limiter
    $rateLimiter = new LoginRateLimiter($conn);
    $clientIp = LoginRateLimiter::getClientIp();
    
    // Check rate limit by IP
    $ipCheck = $rateLimiter->checkLoginAttempt($clientIp);
    if (!$ipCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "message" => "Too many login attempts. Please try again in 15 minutes.",
            "locked_until" => $ipCheck['locked_until']
        ]);
        exit;
    }
    
    // Also check rate limit by email
    $emailCheck = $rateLimiter->checkLoginAttempt($email);
    if (!$emailCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            "success" => false,
            "message" => "This account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes.",
            "locked_until" => $emailCheck['locked_until']
        ]);
        exit;
    }

    // Session is already started by session-config.php

    error_log("Login attempt for email: " . $email);

    // Get user by email
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // Record failed attempt
        $rateLimiter->recordAttempt($clientIp, false);
        $rateLimiter->recordAttempt($email, false);
        
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit;
    }

    $user = $result->fetch_assoc();

    // Verify password
    if (!password_verify($password, $user['password'])) {
        // Record failed attempt
        $rateLimiter->recordAttempt($clientIp, false);
        $rateLimiter->recordAttempt($email, false);
        
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit;
    }

    // Check if email is verified
    if (!$user['is_verified']) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Please verify your email before logging in.",
            "requiresVerification" => true
        ]);
        exit;
    }

    // Set session data with timeout
    $_SESSION = [
        'user_id'    => $user['id'],
        'email'      => $user['email'],
        'first_name' => $user['first_name'] ?? '',
        'role'       => $user['role'],
        'logged_in'  => true,
        'ip'         => $clientIp,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'login_time' => time(),
        'last_activity' => time()
    ];

    // Update last login time
    $updateSql = "UPDATE users SET last_login = NOW() WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("i", $user['id']);
    $updateStmt->execute();
    
    // Record successful login attempt
    $rateLimiter->recordAttempt($clientIp, true);
    $rateLimiter->recordAttempt($email, true);

    // Prepare user data to return (without sensitive info)
    $userData = [
        "id" => $user['id'],
        "email" => $user['email'],
        "first_name" => $user['first_name'] ?? '',
        "role" => $user['role'],
        "is_verified" => (bool)$user['is_verified']
    ];

    // Send success response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => $userData,
        "session_id" => session_id()
    ]);

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    error_log("Login error trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred during login. Please try again later.",
        "debug" => $_ENV['APP_DEBUG'] === 'true' ? $e->getMessage() : null
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    if (isset($conn)) $conn->close();
}