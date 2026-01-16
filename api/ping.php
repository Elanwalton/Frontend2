<?php
// api/ping.php
header('Content-Type: application/json');
echo json_encode([
    "message" => "Pong!",
    "timestamp" => date('Y-m-d H:i:s'),
    "method" => $_SERVER['REQUEST_METHOD']
]);
?>
