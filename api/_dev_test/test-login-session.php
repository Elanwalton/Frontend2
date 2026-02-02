<?php
require 'session-config.php';
require 'connection.php';

// Test login with hardcoded credentials for debugging
$email = 'elanwalker865@gmail.com';
$password = 'walker.W$_x865';

echo "=== Testing Login Session ===\n";
echo "Email: $email\n";
echo "Session ID before login: " . session_id() . "\n";

// Get user by email
$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        echo "Password verification: PASSED\n";
        
        // Set session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        echo "Session data set successfully\n";
        echo "Session ID after login: " . session_id() . "\n";
        echo "Session data: " . print_r($_SESSION, true) . "\n";
        
        // Test check-auth immediately
        echo "\n=== Testing check-auth ===\n";
        if (isset($_SESSION['user_id'])) {
            echo "User ID in session: " . $_SESSION['user_id'] . "\n";
            echo "Authentication should work\n";
        } else {
            echo "User ID not found in session\n";
        }
        
    } else {
        echo "Password verification: FAILED\n";
    }
} else {
    echo "User not found\n";
}

$stmt->close();
$conn->close();
?>
