<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

header('Content-Type: application/json; charset=utf-8');

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if (($auth['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '[]', true);
if (!is_array($body)) $body = [];

$firstName = trim((string)($body['first_name'] ?? ''));
$secondName = trim((string)($body['second_name'] ?? ''));
$email = trim((string)($body['email'] ?? ''));
$phone = isset($body['phone']) ? trim((string)$body['phone']) : null;
$role = (string)($body['role'] ?? 'customer');
$statusUi = (string)($body['status'] ?? 'Unverified');
$password = (string)($body['password'] ?? '');

if ($firstName === '' || $secondName === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'first_name, second_name, email and password are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email']);
    exit;
}

$allowedRoles = ['admin', 'staff', 'customer', 'client', 'user'];
if (!in_array($role, $allowedRoles, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit;
}

// Normalize incoming role values. UI uses customer; DB can keep legacy client.
if ($role === 'customer') {
    $role = 'client';
} elseif ($role === 'user') {
    $role = 'client';
}

$allowedUiStatuses = ['Active', 'Unverified', 'Suspended'];
if (!in_array($statusUi, $allowedUiStatuses, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

try {
    $conn->begin_transaction();

    // Enforce unique email
    $stmtCheck = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    if (!$stmtCheck) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmtCheck->bind_param('s', $email);
    $stmtCheck->execute();
    $exists = $stmtCheck->get_result()->num_rows > 0;
    $stmtCheck->close();

    if ($exists) {
        $conn->rollback();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }

    // Always self-verify: admin-created users start unverified.
    // Suspended users stay suspended + unverified.
    $dbStatus = ($statusUi === 'Suspended') ? 'suspended' : 'active';
    $isVerified = 0;

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare('INSERT INTO users (first_name, second_name, email, password, phone, role, status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param('sssssssi', $firstName, $secondName, $email, $hash, $phone, $role, $dbStatus, $isVerified);
    $stmt->execute();
    $newId = (int)$conn->insert_id;
    $stmt->close();

    // Create verification token
    $verificationToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // Remove old tokens for this user (if any)
    $stmtDel = $conn->prepare('DELETE FROM verification_tokens WHERE user_id = ?');
    if (!$stmtDel) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmtDel->bind_param('i', $newId);
    $stmtDel->execute();
    $stmtDel->close();

    $stmtTok = $conn->prepare('INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
    if (!$stmtTok) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmtTok->bind_param('iss', $newId, $verificationToken, $expiresAt);
    $stmtTok->execute();
    $stmtTok->close();

    $baseUrl = $_ENV['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
    $verificationLink = rtrim($baseUrl, '/') . '/verify-email?token=' . $verificationToken;

    $mailOk = false;
    $mailError = null;
    try {
        require_once __DIR__ . '/../send-mail-smtp.php';
        $mailOk = sendVerificationEmailSMTP($email, $firstName, $verificationLink);
        if (!$mailOk) {
            $mailError = 'Failed to send verification email';
        }
    } catch (Throwable $mailEx) {
        $mailOk = false;
        $mailError = $mailEx->getMessage();
    }

    $conn->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => $mailOk ? 'User created. Verification email sent.' : 'User created. Verification email could not be sent.',
        'id' => $newId,
        'mail_sent' => $mailOk,
        'mail_error' => $mailError,
    ]);
} catch (Throwable $e) {
    $conn->rollback();
    error_log('createUser error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
} finally {
    $conn->close();
}
