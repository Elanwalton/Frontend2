<?php
// api/auth/refresh.php

declare(strict_types=1);

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth_tokens.php';
require_once __DIR__ . '/../auth_cookies.php';
require_once __DIR__ . '/../refresh_tokens.php';

$conn = getDbConnection();
$rawRefresh = $_COOKIE['refresh_token'] ?? '';

if ($rawRefresh === '') {
    sendError(401, 'No refresh token', ['code' => 'NO_REFRESH']);
}

$hash = hash('sha256', $rawRefresh);

$stmt = $conn->prepare('SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW() LIMIT 1');
if (!$stmt) {
    sendError(500, 'Failed to prepare refresh lookup');
}
$stmt->bind_param('s', $hash);
$stmt->execute();
$res  = $stmt->get_result();
$row  = $res->fetch_assoc();
$stmt->close();

if (!$row) {
    clearAuthCookies();
    sendError(401, 'Invalid or expired refresh token', ['code' => 'REFRESH_INVALID']);
}

$userId = (int)$row['user_id'];

// Lookup user
$uStmt = $conn->prepare('SELECT id, email, role, is_verified FROM users WHERE id = ? LIMIT 1');
$uStmt->bind_param('i', $userId);
$uStmt->execute();
$uRes  = $uStmt->get_result();
$user  = $uRes->fetch_assoc();
$uStmt->close();

if (!$user) {
    clearAuthCookies();
    sendError(401, 'User not found for refresh token', ['code' => 'USER_MISSING']);
}

// Rotation: revoke old, issue new
rotateRefreshToken($conn, $rawRefresh, $userId);

// New access token
$accessToken = generateAccessToken($user);
setAccessCookieEnhanced($accessToken);

$userResponse = [
    'id'    => (int)$user['id'],
    'email' => $user['email'],
    'role'  => $user['role'],
];

sendSuccess(['user' => $userResponse]);
