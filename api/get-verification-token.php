<?php
require 'connection.php';

// Get the latest verification token for testing
$email = $_GET['email'] ?? '';

if (empty($email)) {
    echo "Please provide email: ?email=your@email.com\n";
    exit;
}

$sql = "SELECT u.email, vt.token, vt.expires_at 
        FROM users u
        JOIN verification_tokens vt ON u.id = vt.user_id
        WHERE u.email = ?
        ORDER BY vt.created_at DESC
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    echo "=== Verification Token Found ===\n";
    echo "Email: " . $row['email'] . "\n";
    echo "Token: " . $row['token'] . "\n";
    echo "Expires: " . $row['expires_at'] . "\n";
    echo "Expired: " . (new DateTime() > new DateTime($row['expires_at']) ? "YES" : "NO") . "\n";
    
    $verificationLink = "http://localhost:3000/verify-email?token=" . $row['token'];
    echo "Verification Link: $verificationLink\n";
    
} else {
    echo "No verification token found for: $email\n";
}

$stmt->close();
$conn->close();
?>
