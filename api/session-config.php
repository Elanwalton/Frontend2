<?php
// Enhanced session configuration for better persistence
// Call this at the start of all auth-related scripts

// Set session cookie parameters for localhost development
$sessionLifetime = 86400; // 24 hours
$sessionPath = '/'; // Root path for broader access
$sessionDomain = ''; // Default domain for localhost
$sessionSecure = false; // HTTP for local development
$sessionHttpOnly = true;
$sessionSameSite = 'Lax'; // Works for same-site requests

session_set_cookie_params([
    'lifetime' => $sessionLifetime,
    'path' => $sessionPath,
    'domain' => $sessionDomain,
    'secure' => $sessionSecure,
    'httponly' => $sessionHttpOnly,
    'samesite' => $sessionSameSite
]);

// Start session
session_start();

// Regenerate session ID to prevent fixation
if (!isset($_SESSION['regenerated'])) {
    session_regenerate_id(true);
    $_SESSION['regenerated'] = true;
}

// Extend session lifetime on activity
$_SESSION['last_activity'] = time();
?>
