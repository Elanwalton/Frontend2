<?php
// Production PHP Configuration
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');

// Set proper headers
header('Content-Type: application/json');

// Your API code here
?>
