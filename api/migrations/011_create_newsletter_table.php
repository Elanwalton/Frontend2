<?php
require_once __DIR__ . '/../ApiHelper.php';
$conn = getDbConnection();

$sql = "CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'unsubscribed') DEFAULT 'active',
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql)) {
    echo "Table 'newsletter_subscribers' created successfully.\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}
?>
