<?php
// api/mail-config.php

// SMTP Configuration for XAMPP
ini_set('SMTP', 'smtp.gmail.com');
ini_set('smtp_port', 587);
ini_set('sendmail_from', 'noreply@sunleaftechnologies.co.ke');

// For Gmail SMTP with authentication
// You'll need to set these in your php.ini or use PHPMailer
ini_set('auth_username', 'your-email@gmail.com');
ini_set('auth_password', 'your-app-password');

// Alternative: Use SendGrid or other service
// ini_set('SMTP', 'smtp.sendgrid.net');
// ini_set('smtp_port', 587);
// ini_set('auth_username', 'apikey');
// ini_set('auth_password', 'YOUR_SENDGRID_API_KEY');

return [
    'from_email' => 'noreply@sunleaftechnologies.co.ke',
    'from_name' => 'Sunleaf Tech',
    'reply_to' => 'support@sunleaftechnologies.co.ke'
];
?>
