<?php
/**
 * Database Connection Test
 * Run this on Host Africa to diagnose connection issues
 */

header('Content-Type: application/json; charset=utf-8');

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => php_uname(),
    'php_version' => phpversion(),
];

// Test 1: Check if .env file exists
$envFile = __DIR__ . '/.env';
$response['env_file_exists'] = file_exists($envFile);

if (!file_exists($envFile)) {
    $response['error'] = '.env file not found in ' . __DIR__;
    http_response_code(500);
    echo json_encode($response);
    exit;
}

// Test 2: Try loading .env with Dotenv
require_once __DIR__ . '/vendor/autoload.php';

try {
    $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    $response['dotenv_loaded'] = true;
} catch (Exception $e) {
    $response['dotenv_error'] = $e->getMessage();
    $response['dotenv_loaded'] = false;
}

// Test 3: Check environment variables
$response['env_vars'] = [
    'DB_HOST' => $_ENV['DB_HOST'] ?? 'NOT SET',
    'DB_USER' => $_ENV['DB_USER'] ?? 'NOT SET',
    'DB_NAME' => $_ENV['DB_NAME'] ?? 'NOT SET',
    'DB_PASS' => isset($_ENV['DB_PASS']) ? '***' : 'NOT SET',
];

// Test 4: Try database connection
$host = $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';
$db = $_ENV['DB_NAME'] ?? 'sunleaftechnologies';

$response['connection_attempt'] = [
    'host' => $host,
    'user' => $user,
    'database' => $db,
];

$conn = @mysqli_connect($host, $user, $pass, $db);

if ($conn) {
    $response['database_connected'] = true;
    $response['connection_status'] = 'SUCCESS';
    
    // Test query
    $result = $conn->query("SELECT 1");
    $response['test_query'] = $result ? 'SUCCESS' : 'FAILED';
    
    $conn->close();
} else {
    $response['database_connected'] = false;
    $response['connection_status'] = 'FAILED';
    $response['error_message'] = mysqli_connect_error();
    $response['error_code'] = mysqli_connect_errno();
    http_response_code(500);
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
