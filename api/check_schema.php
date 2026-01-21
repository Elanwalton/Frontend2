<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();
$result = $conn->query("SHOW COLUMNS FROM users LIKE 'profile_picture'");

if ($result->num_rows > 0) {
    echo "profile_picture column EXISTS\n";
    $row = $result->fetch_assoc();
    echo "Type: " . $row['Type'] . "\n";
} else {
    echo "profile_picture column DOES NOT EXIST - migration needed\n";
}

$conn->close();

