<?php
require 'session-config.php';

echo "=== Session Debug Info ===\n";
echo "Session ID: " . session_id() . "\n";
echo "Session Status: " . session_status() . "\n";
echo "Session Data: " . print_r($_SESSION, true) . "\n";

// Check cookies
echo "\n=== Cookie Debug Info ===\n";
echo "Cookies: " . print_r($_COOKIE, true) . "\n";

// Check if session cookie exists
$sessionName = session_name();
echo "Session Cookie Name: $sessionName\n";
echo "Session Cookie Exists: " . (isset($_COOKIE[$sessionName]) ? "YES" : "NO") . "\n";
if (isset($_COOKIE[$sessionName])) {
    echo "Session Cookie Value: " . $_COOKIE[$sessionName] . "\n";
}

// Test authentication
require 'connection.php';

if (isset($_SESSION['user_id'])) {
    echo "\n=== Authentication Check ===\n";
    echo "User ID in session: " . $_SESSION['user_id'] . "\n";
    echo "Email in session: " . ($_SESSION['email'] ?? 'Not set') . "\n";
    echo "Role in session: " . ($_SESSION['role'] ?? 'Not set') . "\n";
    echo "Logged in: " . ($_SESSION['logged_in'] ? 'YES' : 'NO') . "\n";
    
    // Verify user exists in database
    $sql = "SELECT id, email, role FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo "Database verification: PASSED\n";
        echo "DB Email: " . $user['email'] . "\n";
        echo "DB Role: " . $user['role'] . "\n";
    } else {
        echo "Database verification: FAILED - User not found\n";
    }
    
    $stmt->close();
} else {
    echo "\n=== Authentication Check ===\n";
    echo "User ID not found in session\n";
}

$conn->close();
?>
