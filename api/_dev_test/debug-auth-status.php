<?php
// Debug authentication status
require_once __DIR__ . '/auth-middleware.php';

$auth = $GLOBALS['_AUTH_USER'] ?? null;

header('Content-Type: application/json');

if ($auth) {
    echo json_encode([
        'authenticated' => true,
        'user' => $auth,
        'role' => $auth['role'],
        'is_admin' => $auth['role'] === 'admin'
    ]);
} else {
    echo json_encode([
        'authenticated' => false,
        'message' => 'No authentication found'
    ]);
}
?>
