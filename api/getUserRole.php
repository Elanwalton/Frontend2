<?php
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/Sunleaf-Tech',
    'domain' => 'localhost',
    'secure' => true,        // TRUE in production
    'httponly' => true,
    'samesite' => 'none'       // 'None' only if Secure=true + HTTPS
]);
session_start();
file_put_contents('session_log.txt', 
    date('Y-m-d H:i:s')."\n".
    "SESSION: ".print_r($_SESSION, true)."\n".
    "COOKIE: ".print_r($_COOKIE, true)."\n\n",
    FILE_APPEND);
// Security headers
require_once 'cors.php';
header("Content-Type: application/json");

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Session validation with debugging
try {
    // Debugging: Log session state
    file_put_contents('session_debug.txt', 
        date('Y-m-d H:i:s') . "\n" . 
        print_r($_SESSION, true) . "\n" .
        print_r($_COOKIE, true)
    );

    if (!empty($_SESSION['user']['id'])) {
        // Successful authentication
        echo json_encode([
            "status" => "authenticated",
            "user" => [
                "id" => $_SESSION['user']['id'],
                "email" => $_SESSION['user']['email'] ?? '',
                "role" => $_SESSION['user']['role'] ?? 'user'
                
            ]
        ]);
    } else {
        // Failed authentication
        session_unset();
        session_destroy();
        
        // Clear session cookie
        setcookie(
            session_name(),
            '',
            time() - 3600,
            '/',
            'localhost',
            false,
            true
        );
        
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Session invalid - please login again"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>