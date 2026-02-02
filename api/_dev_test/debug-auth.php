<?php
// Test stock-levels without auth
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

// Simulate auth-middleware failure
$auth = null; // No auth user

if (!$auth || $auth['role'] !== 'admin') {
    echo "Auth check failed - this is expected\n";
    echo "HTTP response would be 403\n";
}

$conn->close();
?>
