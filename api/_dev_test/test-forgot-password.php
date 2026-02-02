<?php
require 'connection.php';

// Test the forgot password process without email
$email = 'carsonairtel01@gmail.com'; // Use your test email

echo "Testing forgot password process for: $email\n";

try {
    $conn->begin_transaction();
    
    // Check if user exists
    $sql = "SELECT id, first_name FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo "ERROR: User not found with email: $email\n";
        exit;
    }
    
    $user = $result->fetch_assoc();
    echo "Found user: " . $user['first_name'] . " (ID: " . $user['id'] . ")\n";
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    echo "Generated token: $resetToken\n";
    echo "Expires at: $expiresAt\n";
    
    // Delete any existing reset tokens for this user
    $deleteSql = "DELETE FROM password_reset_tokens WHERE user_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $user['id']);
    $deleteStmt->execute();
    
    // Insert new reset token
    $tokenSql = "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $tokenStmt = $conn->prepare($tokenSql);
    $tokenStmt->bind_param("iss", $user['id'], $resetToken, $expiresAt);
    
    if (!$tokenStmt->execute()) {
        echo "ERROR: Failed to insert token: " . $tokenStmt->error . "\n";
        throw new Exception("Failed to generate reset token.");
    }
    
    echo "SUCCESS: Token inserted with ID: " . $conn->insert_id . "\n";
    
    $conn->commit();
    
    // Show the reset link
    $resetLink = "http://localhost:3000/reset-password?token=" . $resetToken;
    echo "Reset link: $resetLink\n";
    
} catch (Exception $e) {
    $conn->rollback();
    echo "ERROR: " . $e->getMessage() . "\n";
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($deleteStmt)) $deleteStmt->close();
    if (isset($tokenStmt)) $tokenStmt->close();
    $conn->close();
}
?>
