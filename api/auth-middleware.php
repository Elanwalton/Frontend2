<?php
// api/auth-middleware.php
// Include in any protected endpoint

declare(strict_types=1);

require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth_tokens.php';
require_once __DIR__ . '/public-endpoints.php';

// Check if current endpoint is public (should not require authentication)
$request_uri = $_SERVER['REQUEST_URI'] ?? '';
$endpoint_name = basename($request_uri, '.php');

if (isPublicEndpoint($endpoint_name)) {
    // Public endpoint - no authentication required
    return;
}

$accessToken = $_COOKIE['access_token'] ?? '';
if ($accessToken === '') {
    sendError(401, 'Missing access token', ['code' => 'NO_ACCESS']);
}

try {
    $payload = validateAccessToken($accessToken);
    $userId  = (int)($payload['sub'] ?? 0);
    $role    = $payload['role'] ?? 'customer';

    if ($userId <= 0) {
        sendError(401, 'Invalid access token payload', ['code' => 'ACCESS_INVALID']);
    }

    $GLOBALS['_AUTH_USER'] = [
        'id'    => $userId,
        'role'  => $role,
        'email' => $payload['email'] ?? null,
    ];
} catch (Firebase\JWT\ExpiredException $e) {
    sendError(401, 'Access token expired', ['code' => 'ACCESS_EXPIRED']);
} catch (Exception $e) {
    sendError(401, 'Invalid access token', ['code' => 'ACCESS_INVALID']);
}

