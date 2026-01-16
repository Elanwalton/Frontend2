<?php
// api/send-mail.php

function sendVerificationEmail($to, $firstName, $verificationLink) {
    $subject = "Verify Your Email Address - Sunleaf Tech";
    
    $message = "
    <html>
    <head>
        <title>Verify Your Email Address</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
            .button {
                display: inline-block; 
                padding: 12px 24px; 
                margin: 20px 0; 
                background-color: #10b981; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
                font-weight: bold;
            }
            .footer { 
                margin-top: 30px; 
                font-size: 12px; 
                color: #666; 
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Sunleaf Tech</h1>
            </div>
            <h2>Welcome to Sunleaf Tech!</h2>
            <p>Hello $firstName,</p>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <p>
                <a href='$verificationLink' class='button'>Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href='$verificationLink'>$verificationLink</a></p>
            <p>This link will expire in 24 hours.</p>
            <div class='footer'>
                <p>If you didn't create an account, please ignore this email or contact support if you have any questions.</p>
                <p>© " . date('Y') . " Sunleaf Tech. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // To send HTML mail, the Content-type header must be set
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Sunleaf Tech <noreply@sunleaftest.tech>' . "\r\n";
    $headers .= 'Reply-To: support@sunleaftest.tech' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();
    
    return mail($to, $subject, $message, $headers);
}
?>
