<?php
// api/test-verify.php
header('Content-Type: application/json');

$token = $_GET['token'] ?? 'test-token';

echo json_encode([
    "message" => "Test endpoint reached",
    "token_received" => $token,
    "timestamp" => date('Y-m-d H:i:s'),
    "server_info" => [
        "HTTP_HOST" => $_SERVER['HTTP_HOST'] ?? 'not set',
        "REQUEST_URI" => $_SERVER['REQUEST_URI'] ?? 'not set',
        "REQUEST_METHOD" => $_SERVER['REQUEST_METHOD'] ?? 'not set'
    ]
]);
?>
