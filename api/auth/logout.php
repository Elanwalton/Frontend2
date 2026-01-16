<?php
// api/auth/logout.php

declare(strict_types=1);

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../refresh_tokens.php';
require_once __DIR__ . '/../auth_cookies.php';

$conn = getDbConnection();
$rawRefresh = $_COOKIE['refresh_token'] ?? '';

if ($rawRefresh !== '') {
    revokeRefreshToken($conn, $rawRefresh);
}

clearAuthCookies();

sendSuccess(['message' => 'Logged out']);
