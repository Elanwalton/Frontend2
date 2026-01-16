<?php
require 'connection.php';

$sql = "CREATE TABLE IF NOT EXISTS signup_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_ip_created (ip, created_at)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table signup_attempts created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
