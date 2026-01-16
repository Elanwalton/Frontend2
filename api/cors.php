<?php
// Load composer autoload and .env from api directory
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    if (class_exists('Dotenv\Dotenv')) {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->safeLoad();
    }
}

// Determine SPA origin with fallback
$spa_origin = $_ENV['SPA_ORIGIN'] ?? getenv('SPA_ORIGIN') ?: 'http://localhost:3000';

// Send CORS headers
header("Access-Control-Allow-Origin: " . $spa_origin);
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Vary: Origin");

// Short-circuit OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}