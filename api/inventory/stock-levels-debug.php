<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

header('Content-Type: application/json');

// Debug: Check what happens before auth
$accessToken = $_COOKIE['access_token'] ?? '';
$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

echo json_encode([
    'debug' => [
        'cookie_exists' => !empty($accessToken),
        'cookie_value' => substr($accessToken, 0, 20) . '...',
        'auth_user_set' => !empty($auth),
        'auth_data' => $auth
    ]
]);
?>
