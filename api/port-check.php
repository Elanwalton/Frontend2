<?php
// api/port-check.php
header('Content-Type: application/json');

echo json_encode([
    "message" => "API is working!",
    "server_port" => $_SERVER['SERVER_PORT'] ?? 'unknown',
    "http_host" => $_SERVER['HTTP_HOST'] ?? 'unknown',
    "server_name" => $_SERVER['SERVER_NAME'] ?? 'unknown',
    "request_uri" => $_SERVER['REQUEST_URI'] ?? 'unknown',
    "all_server_vars" => $_SERVER
]);
?>
