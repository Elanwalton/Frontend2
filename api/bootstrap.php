<?php
header("Content-Type: application/json");

// Load ApiHelper for proper CORS handling
require_once 'ApiHelper.php';

// Debug mode for development
define('DEBUG', true);
if (DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}

// Environment loading with better error handling
$envFile = __DIR__.'/.env';
if (!file_exists($envFile)) {
    die(json_encode(['error' => 'Missing .env file']));
}

$env = parse_ini_file($envFile);
if ($env === false) {
    die(json_encode(['error' => 'Invalid .env format']));
}

foreach ($env as $k => $v) {
    $_ENV[$k] = $v;
    putenv("$k=$v");
}

// Only start session if needed
if (str_contains($_SERVER['REQUEST_URI'], '/admin')) {
    ini_set('session.cookie_samesite', 'Lax');
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}