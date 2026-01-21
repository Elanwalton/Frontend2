<?php
require_once __DIR__ . '/../ApiHelper.php';
$db = getDbConnection();

$sql = "CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($db->query($sql)) {
    echo "Table 'contact_messages' created successfully or already exists.\n";
} else {
    echo "Error creating table: " . $db->error . "\n";
}
?>
