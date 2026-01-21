<?php
// Load environment variables and initialize API
require_once __DIR__ . '/ApiHelper.php';

// Get database connection
$conn = getDbConnection();

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define base URL
define('BASE_URL', $_ENV['NEXT_PUBLIC_API_URL'] ?? 'http://localhost/frontend2-dev');

// Timezone
date_default_timezone_set('Africa/Nairobi');
?>
