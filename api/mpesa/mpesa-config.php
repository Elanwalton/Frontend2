<?php
// api/mpesa-config.php

// Load environment variables
require __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// M-Pesa Configuration
class MpesaConfig {
    // Environment (sandbox or live)
    public static $env;
    
    // Sandbox Credentials
    public static $sandbox_consumer_key;
    public static $sandbox_consumer_secret;
    public static $sandbox_shortcode;
    public static $sandbox_passkey;
    
    // Live Credentials
    public static $live_consumer_key;
    public static $live_consumer_secret;
    public static $live_shortcode;
    public static $live_passkey;
    
    // API URLs
    public static $sandbox_oauth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    public static $sandbox_stkpush_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    
    public static $live_oauth_url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    public static $live_stkpush_url = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    
    // Callback URLs
    public static $callback_url;
    public static $confirmation_url;
    public static $validation_url;
    
    // Initialize static properties
    public static function init() {
        self::$env = $_ENV['MPESA_ENV'] ?? 'sandbox';
        self::$sandbox_consumer_key = $_ENV['MPESA_SANDBOX_CONSUMER_KEY'] ?? '';
        self::$sandbox_consumer_secret = $_ENV['MPESA_SANDBOX_CONSUMER_SECRET'] ?? '';
        self::$sandbox_shortcode = $_ENV['MPESA_SANDBOX_SHORTCODE'] ?? '174379';
        self::$sandbox_passkey = $_ENV['MPESA_SANDBOX_PASSKEY'] ?? 'bfb279f9aa9bdbcf158e97dd71a467cd2e3c0ade';
        
        self::$live_consumer_key = $_ENV['MPESA_LIVE_CONSUMER_KEY'] ?? '';
        self::$live_consumer_secret = $_ENV['MPESA_LIVE_CONSUMER_SECRET'] ?? '';
        self::$live_shortcode = $_ENV['MPESA_LIVE_SHORTCODE'] ?? '';
        self::$live_passkey = $_ENV['MPESA_LIVE_PASSKEY'] ?? '';
        
        self::$callback_url = $_ENV['MPESA_CALLBACK_URL'] ?? 'https://hallucal-sibyl-superrespectably.ngrok-free.dev/sunleaf-tech/api/mpesa/mpesa-callback.php';
        self::$confirmation_url = $_ENV['MPESA_CONFIRMATION_URL'] ?? 'http://localhost/sunleaf-tech/api/mpesa-confirmation.php';
        self::$validation_url = $_ENV['MPESA_VALIDATION_URL'] ?? 'http://localhost/sunleaf-tech/api/mpesa-validation.php';
    }
    
    // Get current environment config
    public static function getConfig() {
        if (self::$env === 'live') {
            return [
                'consumer_key' => self::$live_consumer_key,
                'consumer_secret' => self::$live_consumer_secret,
                'shortcode' => self::$live_shortcode,
                'passkey' => self::$live_passkey,
                'oauth_url' => self::$live_oauth_url,
                'stkpush_url' => self::$live_stkpush_url
            ];
        } else {
            return [
                'consumer_key' => self::$sandbox_consumer_key,
                'consumer_secret' => self::$sandbox_consumer_secret,
                'shortcode' => self::$sandbox_shortcode,
                'passkey' => self::$sandbox_passkey,
                'oauth_url' => self::$sandbox_oauth_url,
                'stkpush_url' => self::$sandbox_stkpush_url
            ];
        }
    }
    
    // Generate password for STK Push
    public static function generatePassword($shortcode, $passkey, $timestamp) {
        return base64_encode($shortcode . $passkey . $timestamp);
    }
    
    // Get current timestamp
    public static function getTimestamp() {
        return date('YmdHis');
    }
}
?>
