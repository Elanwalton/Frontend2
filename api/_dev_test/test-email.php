<?php
// Test email sending
require 'send-mail-smtp.php';

$testEmail = 'carsonairtel01@gmail.com'; // Use the same email you're testing with
$testName = 'Test User';
$testLink = 'http://localhost:3000/reset-password?token=test123';

echo "Testing password reset email to: $testEmail\n";

try {
    $result = sendPasswordResetEmailSMTP($testEmail, $testName, $testLink);
    
    if ($result) {
        echo "SUCCESS: Email sent successfully!\n";
    } else {
        echo "FAILED: Email was not sent\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// Also test the verification email function
echo "\nTesting verification email to: $testEmail\n";

try {
    $result = sendVerificationEmailSMTP($testEmail, $testName, $testLink);
    
    if ($result) {
        echo "SUCCESS: Verification email sent successfully!\n";
    } else {
        echo "FAILED: Verification email was not sent\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
