<?php
require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

// Load .env file
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Assign variables
$host = $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';
$db   = $_ENV['DB_NAME'] ?? 'sunleaftechnologies';

// Connect to database
$conn = mysqli_connect($host, $user, $pass, $db);

// Check connection
if (!$conn) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . mysqli_connect_error()
    ]));
}
?>
