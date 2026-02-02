<?php
// api/debug-mail.php

header('Content-Type: application/json');

// Check current PHP mail configuration
$config = [
    'SMTP' => ini_get('SMTP'),
    'smtp_port' => ini_get('smtp_port'),
    'sendmail_from' => ini_get('sendmail_from'),
    'sendmail_path' => ini_get('sendmail_path'),
    'mail.add_x_header' => ini_get('mail.add_x_header'),
    'auth_username' => ini_get('auth_username'),
    'auth_password' => ini_get('auth_password') ? '***SET***' : 'NOT SET'
];

// Test sending a simple email
$testEmail = $_GET['email'] ?? 'test@example.com';
$subject = "Debug Test";
$message = "Simple test message at " . date('Y-m-d H:i:s');
$headers = 'From: test@sunleaftest.tech';

$mailResult = mail($testEmail, $subject, $message, $headers);

echo json_encode([
    "config" => $config,
    "mail_test" => [
        "sent" => $mailResult,
        "to" => $testEmail,
        "error" => error_get_last()
    ],
    "php_version" => PHP_VERSION,
    "server_info" => [
        "OS" => PHP_OS,
        "Server" => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
    ]
]);
?>
