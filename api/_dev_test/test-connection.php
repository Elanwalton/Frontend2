<?php
// Simple connection test
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...\n";

// Load .env
require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "Environment loaded.\n";

// Get variables
$host = $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';
$db = $_ENV['DB_NAME'] ?? 'sunleaftechnologies';

echo "Host: $host\n";
echo "User: $user\n";
echo "DB: $db\n";
echo "Pass: " . (empty($pass) ? '(empty)' : '(set)') . "\n";

// Test connection
$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    echo "Connection failed: " . mysqli_connect_error() . "\n";
    exit(1);
}

echo "Connection successful!\n";

// Test query
$result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users");
if ($result) {
    $row = mysqli_fetch_assoc($result);
    echo "Users table count: " . $row['count'] . "\n";
} else {
    echo "Query failed: " . mysqli_error($conn) . "\n";
}

mysqli_close($conn);
?>
