<?php
// api/test-phpmailer.php

header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';

$testEmail = $_GET['email'] ?? 'elanwalton@gmail.com';

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'elanwalton@gmail.com';
    $mail->Password   = 'aisn oqhu zufq zkrk'; // Your Gmail app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    
    // Recipients
    $mail->setFrom('noreply@sunleaftest.tech', 'Sunleaf Tech');
    $mail->addAddress($testEmail);
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = 'PHPMailer Test - Sunleaf Tech';
    $mail->Body    = '<h1>Test Email</h1><p>This is a test from PHPMailer!</p>';
    
    $mail->send();
    
    echo json_encode([
        "success" => true,
        "message" => "PHPMailer test email sent successfully!",
        "to" => $testEmail
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "PHPMailer Error: " . $mail->ErrorInfo,
        "to" => $testEmail
    ]);
}
?>
