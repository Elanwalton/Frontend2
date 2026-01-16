<?php
require 'connection.php';

$email = $_GET['email'] ?? '';

if (empty($email)) {
    echo "Please provide email: ?email=your@email.com\n";
    exit;
}

// Update user role from 'user' to 'client'
$sql = "UPDATE users SET role = 'client' WHERE email = ? AND role = 'user'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();

$updated = $stmt->affected_rows;
echo "Updated $updated user(s) role from 'user' to 'client'\n";

// Verify the update
$checkSql = "SELECT id, email, role FROM users WHERE email = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    $user = $checkResult->fetch_assoc();
    echo "Current role: '" . $user['role'] . "'\n";
}

$stmt->close();
$checkStmt->close();
$conn->close();
?>
