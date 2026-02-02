<?php
// api/test-mail.php

header('Content-Type: application/json');

// Test mail configuration
$testEmail = $_GET['email'] ?? 'test@example.com';
$subject = "Mail Test - Sunleaf Tech";
$message = "
<html>
<body>
    <h2>Mail Configuration Test</h2>
    <p>This is a test email to verify your mail configuration is working.</p>
    <p>If you receive this email, your mail settings are correct!</p>
    <p>Sent at: " . date('Y-m-d H:i:s') . "</p>
</body>
</html>
";

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= 'From: Sunleaf Tech <noreply@sunleaftest.tech>' . "\r\n";
$headers .= 'Reply-To: support@sunleaftest.tech' . "\r\n";

$mailSent = mail($testEmail, $subject, $message, $headers);

echo json_encode([
    "success" => $mailSent,
    "message" => $mailSent ? "Test email sent successfully!" : "Failed to send test email.",
    "test_email" => $testEmail,
    "timestamp" => date('Y-m-d H:i:s')
]);
?>
