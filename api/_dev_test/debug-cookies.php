<?php
require 'session-config.php';

echo "=== Cookie Debug ===\n";

// Show current cookie settings
echo "Current Cookie Settings:\n";
$cookieParams = session_get_cookie_params();
echo "Lifetime: " . $cookieParams['lifetime'] . " seconds\n";
echo "Path: " . $cookieParams['path'] . "\n";
echo "Domain: " . ($cookieParams['domain'] ?: 'default') . "\n";
echo "Secure: " . ($cookieParams['secure'] ? 'true' : 'false') . "\n";
echo "HttpOnly: " . ($cookieParams['httponly'] ? 'true' : 'false') . "\n";
echo "SameSite: " . $cookieParams['samesite'] . "\n";

// Show all cookies received
echo "\nReceived Cookies:\n";
if (empty($_COOKIE)) {
    echo "No cookies received\n";
} else {
    foreach ($_COOKIE as $name => $value) {
        echo "$name = $value\n";
    }
}

// Show session cookie specifically
$sessionName = session_name();
echo "\nSession Cookie: $sessionName\n";
echo "Session cookie exists: " . (isset($_COOKIE[$sessionName]) ? 'YES' : 'NO') . "\n";
if (isset($_COOKIE[$sessionName])) {
    echo "Session cookie value: " . $_COOKIE[$sessionName] . "\n";
}

// Test setting a simple test cookie
setcookie('test_cookie', 'test_value', time() + 3600, '/', '', false, true);
echo "\nSet test cookie for debugging\n";

// Show headers being sent
echo "\nHeaders being sent:\n";
$headers = headers_list();
foreach ($headers as $header) {
    if (strpos($header, 'Set-Cookie') !== false) {
        echo "$header\n";
    }
}
?>
