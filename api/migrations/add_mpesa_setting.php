<?php
require_once __DIR__ . '/../ApiHelper.php';

$conn = getDbConnection();

$key = 'mpesa_enabled';
$value = 'false';
$type = 'boolean';
$category = 'payment';
$desc = 'Enable M-Pesa';

// Check if exists
$checkSql = "SELECT id FROM site_settings WHERE setting_key = ?";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param('s', $key);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "Setting '$key' not found. Inserting...\n";
    $insertSql = "INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param('sssss', $key, $value, $type, $category, $desc);
    if ($stmt->execute()) {
        echo "Successfully inserted '$key'.\n";
    } else {
        echo "Error inserting '$key': " . $stmt->error . "\n";
    }
} else {
    echo "Setting '$key' already exists.\n";
}

$conn->close();
?>
