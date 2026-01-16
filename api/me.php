<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();
header("Content-Type: application/json");

// Token-based authentication
$token = getAuthToken();
$user = validateToken($conn, $token);

echo json_encode([
    "authenticated" => true,
    "user" => [
        "id" => (int)($user['user_id'] ?? $user['id'] ?? 0),
        "email" => $user['email'] ?? null,
        "role" => $user['role'] ?? null,
    ]
]);
