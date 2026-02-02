<?php
header('Content-Type: text/plain');

// Load .env
$envFile = __DIR__ . '/.env';
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos($line, '=') === false || strpos($line, '#') === 0) continue;
    list($key, $value) = explode('=', $line, 2);
    $_ENV[trim($key)] = trim($value, ' "\'');
}

// Test connection with timeout
$host = $_ENV['DB_HOST'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$db = $_ENV['DB_NAME'];

echo "Testing connection to $host...\n";

// Test with timeout
ini_set('default_socket_timeout', 5);
$conn = @mysqli_connect($host, $user, $pass, $db);

if ($conn) {
    echo "SUCCESS: Connected to database\n";
    echo "Server: " . mysqli_get_server_info($conn) . "\n";
    mysqli_close($conn);
} else {
    echo "FAILED: " . mysqli_connect_error() . "\n";
    echo "Code: " . mysqli_connect_errno() . "\n";
}

echo "Test completed.\n";
?>
