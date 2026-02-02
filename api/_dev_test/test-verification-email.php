<?php
require 'send-mail-smtp.php';

// Test verification email with the same email you're signing up with
$testEmail = 'carsonairtel01@gmail.com'; // Use your actual signup email
$testName = 'Test User';
$testLink = 'http://localhost:3000/verify-email?token=test123456';

echo "Testing verification email to: $testEmail\n";

try {
    $result = sendVerificationEmailSMTP($testEmail, $testName, $testLink);
    
    if ($result) {
        echo "SUCCESS: Verification email sent successfully!\n";
        echo "Check your inbox AND spam folder.\n";
    } else {
        echo "FAILED: Verification email was not sent\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// Also check the latest signup to see if verification token was created
require 'connection.php';

echo "\n=== Latest Signup ===\n";
$sql = "SELECT u.email, u.first_name, vt.token, vt.expires_at 
        FROM users u
        LEFT JOIN verification_tokens vt ON u.id = vt.user_id
        ORDER BY u.id DESC
        LIMIT 3";

$result = $conn->query($sql);
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "Email: " . $row['email'] . "\n";
        echo "Name: " . $row['first_name'] . "\n";
        echo "Token: " . ($row['token'] ?? 'No token') . "\n";
        echo "Expires: " . ($row['expires_at'] ?? 'N/A') . "\n";
        echo "---\n";
    }
} else {
    echo "No signups found\n";
}

$conn->close();
?>
