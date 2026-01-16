<?php
// SunLeaf Tech GA4 Configuration - CORRECT PATH
define('GA4_PROPERTY_ID', 'properties/514642624'); 
define('CREDENTIALS_PATH', __DIR__ . '/service-account-credentials.json');

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load Composer autoloader from correct location
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    // Don't output anything, just let the calling script handle missing dependencies
    return;
}

require_once __DIR__ . '/../vendor/autoload.php';

// Don't output anything here - let the calling script handle responses
?>