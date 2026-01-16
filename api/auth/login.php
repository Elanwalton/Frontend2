<?php
// api/auth/login.php

declare(strict_types=1);

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth_tokens.php';
require_once __DIR__ . '/../auth_cookies.php';
require_once __DIR__ . '/../refresh_tokens.php';
require_once __DIR__ . '/../LoginRateLimiter.php';

$conn       = getDbConnection();
$stmt       = null;
$updateStmt = null;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $data = getJsonInput();

    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if ($email === '' || $password === '') {
        sendError(400, 'Email and password are required');
    }

    // Rate limiting
    $rateLimiter = new LoginRateLimiter($conn);
    $clientIp    = LoginRateLimiter::getClientIp();

    $ipCheck = $rateLimiter->checkLoginAttempt($clientIp);
    if (!$ipCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            'success'      => false,
            'message'      => 'Too many login attempts. Please try again in 15 minutes.',
            'locked_until' => $ipCheck['locked_until'],
        ]);
        exit;
    }

    $emailCheck = $rateLimiter->checkLoginAttempt($email);
    if (!$emailCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            'success'      => false,
            'message'      => 'This account has been temporarily locked due to too many failed login attempts.',
            'locked_until' => $emailCheck['locked_until'],
        ]);
        exit;
    }

    // Fetch user
    $stmt = $conn->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    if (!$stmt) {
        sendError(500, 'Failed to prepare user lookup');
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $rateLimiter->recordAttempt($clientIp, false);
        $rateLimiter->recordAttempt($email, false);

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password.',
        ]);
        exit;
    }

    $user = $result->fetch_assoc();

    // Password check
    if (!password_verify($password, $user['password'])) {
        $rateLimiter->recordAttempt($clientIp, false);
        $rateLimiter->recordAttempt($email, false);

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password.',
        ]);
        exit;
    }

    // Email verification
    if (!(bool)$user['is_verified']) {
        http_response_code(403);
        echo json_encode([
            'success'              => false,
            'message'              => 'Please verify your email before logging in.',
            'requiresVerification' => true,
        ]);
        exit;
    }

    // Update last login
    $updateStmt = $conn->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    if ($updateStmt) {
        $updateStmt->bind_param('i', $user['id']);
        $updateStmt->execute();
    }

    // Record successful attempt
    $rateLimiter->recordAttempt($clientIp, true);
    $rateLimiter->recordAttempt($email, true);

    // Tokens
    $accessToken = generateAccessToken($user);
    setAccessCookieEnhanced($accessToken);
    issueRefreshToken($conn, (int)$user['id']);

    $userResponse = [
        'id'          => (int)$user['id'],
        'email'       => $user['email'],
        'first_name'  => $user['first_name'] ?? '',
        'role'        => $user['role'],
        'is_verified' => (bool)$user['is_verified'],
    ];

    sendSuccess([
        'user'    => $userResponse,
        'message' => 'Login successful',
    ]);

} catch (Throwable $e) {
    error_log('Login error: ' . $e->getMessage());
    error_log($e->getTraceAsString());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during login. Please try again later.',
        'debug'   => ($_ENV['APP_DEBUG'] ?? 'false') === 'true' ? $e->getMessage() : null,
    ]);
} finally {
    if ($stmt instanceof mysqli_stmt) {
        $stmt->close();
    }

    if ($updateStmt instanceof mysqli_stmt) {
        $updateStmt->close();
    }

    if ($conn instanceof mysqli) {
        $conn->close();
    }
}
