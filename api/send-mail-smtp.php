<?php
// api/send-mail-smtp.php

// Load environment variables
require_once __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Load PHPMailer classes only if not already loaded
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    require 'PHPMailer-master/src/PHPMailer.php';
    require 'PHPMailer-master/src/SMTP.php';
    require 'PHPMailer-master/src/Exception.php';
}

// Use the PHPMailer namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sendVerificationEmailSMTP($to, $firstName, $verificationLink) {
    $mail = new PHPMailer(true);
    
    try {
        // Server settings from environment variables
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 587);
        $mail->SMTPDebug  = 0;
        $mail->Debugoutput = 'error_log';
        
        // Recipients from environment variables
        $fromEmail = $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@sunleaftechnologies.co.ke';
        $fromName  = $_ENV['MAIL_FROM_NAME'] ?? 'Sunleaf Tech';
        $replyTo   = $_ENV['MAIL_REPLY_TO_EMAIL'] ?? 'support@sunleaftechnologies.co.ke';
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to, $firstName);
        $mail->addReplyTo($replyTo, $fromName . ' Support');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Verify Your Email Address - Sunleaf Tech';
        
        $mail->Body = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Verify Your Email Address - Sunleaf Tech</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
                .button {
                    display: inline-block; 
                    padding: 10px 20px; 
                    margin: 20px 0; 
                    background-color: #10b981; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px;
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
                <h2>Verify Your Email Address</h2>
                <p>Hello {$firstName},</p>
                <p>We've received a request to verify your email address. Please click the button below to complete verification:</p>
                <p>
                    <a href='{$verificationLink}' class='button'>Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href='{$verificationLink}'>{$verificationLink}</a></p>
                <p>This link will expire in 24 hours.</p>
                <div class='footer'>
                    <p>If you didn't request this email, you can safely ignore it.</p>
                    <p> Sunleaf Tech. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
}

function sendQuoteEmailSMTP($to, $customerName, $quoteNumber, $quoteData, $validUntil) {
    $mail = new PHPMailer(true);
    
    try {
        // Server settings from environment variables
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 587);
        
        // Recipients
        $fromEmail = $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@sunleaftechnologies.co.ke';
        $fromName  = $_ENV['MAIL_FROM_NAME'] ?? 'Sunleaf Tech';
        $replyTo   = $_ENV['MAIL_REPLY_TO_EMAIL'] ?? 'support@sunleaftechnologies.co.ke';
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to, $customerName);
        $mail->addReplyTo($replyTo, $fromName . ' Support');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = "Quote #{$quoteNumber} - Sunleaf Tech";
        
        // Generate quote HTML using the provided template
        $mail->Body = generateQuoteHTML($customerName, $quoteNumber, $quoteData, $validUntil);
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
}

function generateQuoteHTML($customerName, $quoteNumber, $quoteData, $validUntil) {
    return "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Quote from Sunleaf Tech</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
            }
            
            .email-wrapper {
                max-width: 650px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .header {
                background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header h1 {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .header p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 15px;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 15px;
            }
            
            .message {
                color: #4a4a4a;
                font-size: 15px;
                line-height: 1.8;
                margin-bottom: 30px;
            }
            
            .quote-card {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
                border-left: 4px solid #0ea5e9;
            }
            
            .quote-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(14, 165, 233, 0.2);
            }
            
            .quote-number {
                font-size: 14px;
                color: #0ea5e9;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            
            .quote-date {
                font-size: 13px;
                color: #666;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                background: #fafafa;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 30px;
            }
            
            .items-table th {
                padding: 12px 15px;
                text-align: left;
                font-size: 12px;
                font-weight: 700;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: #f0f0f0;
            }
            
            .items-table td {
                padding: 15px;
                font-size: 14px;
                color: #4a4a4a;
            }
            
            .items-table tbody tr {
                border-bottom: 1px solid #e0e0e0;
            }
            
            .totals-section {
                background: #fafafa;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                font-size: 14px;
            }
            
            .totals-row.total {
                font-size: 20px;
                font-weight: 700;
                color: #1a1a1a;
                padding-top: 15px;
                border-top: 2px solid #0ea5e9;
            }
            
            .cta-section {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .cta-button {
                display: inline-block;
                padding: 16px 40px;
                background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
                color: white;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 16px;
                box-shadow: 0 10px 30px rgba(14, 165, 233, 0.3);
                transition: all 0.3s ease;
            }
            
            .footer {
                background: #1a1a1a;
                padding: 40px 30px;
                text-align: center;
            }
            
            .footer-title {
                font-size: 18px;
                font-weight: 700;
                color: white;
                margin-bottom: 10px;
            }
            
            .footer-text {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 20px;
            }
            
            @media only screen and (max-width: 600px) {
                body { padding: 20px 10px; }
                .email-wrapper { border-radius: 12px; }
                .header { padding: 30px 20px; }
                .content { padding: 30px 20px; }
                .cta-button { display: block; width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class='email-wrapper'>
            <div class='header'>
                <h1>Sunleaf Tech</h1>
                <p>Your Solar Energy Partner</p>
            </div>
            
            <div class='content'>
                <div class='greeting'>Hello {$customerName},</div>
                
                <div class='message'>
                    Thank you for your interest in our products! We're pleased to provide you with the following quote for your review.
                </div>
                
                <div class='quote-card'>
                    <div class='quote-header'>
                        <span class='quote-number'>QUOTE #{$quoteNumber}</span>
                        <span class='quote-date'>" . date('F j, Y') . "</span>
                    </div>
                </div>
                
                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        " . generateQuoteItems($quoteData) . "
                    </tbody>
                </table>
                
                <div class='totals-section'>
                    <div class='totals-row total'>
                        <span>Total Amount</span>
                        <span>" . (isset($quoteData['total']) ? number_format($quoteData['total'], 2) : '0.00') . "</span>
                    </div>
                </div>
                
                <div class='cta-section'>
                    <a href='https://sunleaftechnologies.co.ke/quotes/accept/{$quoteNumber}' class='cta-button'>
                        Accept Quote
                    </a>
                </div>
            </div>
            
            <div class='footer'>
                <div class='footer-title'>Sunleaf Tech</div>
                <div class='footer-text'>Powering a Sustainable Future</div>
                <div class='footer-text'>If you have any questions, please contact us at support@sunleaftechnologies.co.ke</div>
                <div class='footer-text'> Sunleaf Tech. All rights reserved.</div>
            </div>
        </div>
    </body>
    </html>
    ";
}

function generateQuoteItems($quoteData) {
    $items = '';
    
    if (isset($quoteData['items']) && is_array($quoteData['items'])) {
        foreach ($quoteData['items'] as $item) {
            $items .= "
            <tr>
                <td class='item-name'>" . htmlspecialchars($item['name']) . "</td>
                <td class='item-quantity'>" . htmlspecialchars($item['quantity']) . "</td>
                <td class='item-price'>" . htmlspecialchars($item['price']) . "</td>
            </tr>
            ";
        }
    }
    
    return $items;
}

function sendPasswordResetEmailSMTP($to, $firstName, $resetLink) {
    $mail = new PHPMailer(true);
    
    try {
        // Server settings from environment variables
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 587);
        $mail->SMTPDebug  = 0;
        $mail->Debugoutput = 'error_log';
        
        // Recipients from environment variables
        $fromEmail = $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@sunleaftechnologies.co.ke';
        $fromName  = $_ENV['MAIL_FROM_NAME'] ?? 'Sunleaf Tech';
        $replyTo   = $_ENV['MAIL_REPLY_TO_EMAIL'] ?? 'support@sunleaftechnologies.co.ke';
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to, $firstName);
        $mail->addReplyTo($replyTo, $fromName . ' Support');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Reset Your Password';
        $mail->Body = "
        <html>
        <head>
            <title>Reset Your Password</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button {
                    display: inline-block; 
                    padding: 10px 20px; 
                    margin: 20px 0; 
                    background-color: #10b981; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px;
                }
                .footer { 
                    margin-top: 30px; 
                    font-size: 12px; 
                    color: #666; 
                }
                .warning {
                    color: #ef4444;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Reset Your Password</h2>
                <p>Hello {$firstName},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p>
                    <a href='{$resetLink}' class='button'>Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href='{$resetLink}'>{$resetLink}</a></p>
                <p class='warning'>This link will expire in 1 hour.</p>
                <div class='footer'>
                    <p>If you didn't request this email, you can safely ignore it. Your password will remain unchanged.</p>
                    <p>© " . date('Y') . " Sunleaf Tech. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("PHPMailer Error (Password Reset): " . $mail->ErrorInfo);
        return false;
    }
}
?>
