<?php
require 'session-config.php';
require 'connection.php';

echo "=== Complete Session Flow Test ===\n";

// Test 1: Check current session state
echo "1. Current Session State:\n";
echo "   Session ID: " . session_id() . "\n";
echo "   Session Data: " . print_r($_SESSION, true) . "\n";

// Test 2: Simulate login
echo "\n2. Simulating Login:\n";
$email = 'elanwalker865@gmail.com';
$password = 'walker.W$_x865';

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    if (password_verify($password, $user['password'])) {
        echo "   Password verification: PASSED\n";
        
        // Set session data exactly like Login.php
        $_SESSION = [
            'user_id'    => $user['id'],
            'email'      => $user['email'],
            'first_name' => $user['first_name'],
            'role'       => $user['role'],
            'logged_in'  => true,
            'ip'         => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'login_time' => time(),
            'last_activity' => time()
        ];
        
        echo "   Session data set successfully\n";
        echo "   New Session ID: " . session_id() . "\n";
        echo "   Session Data: " . print_r($_SESSION, true) . "\n";
        
        // Test 3: Check authentication immediately
        echo "\n3. Immediate Auth Check:\n";
        if (isset($_SESSION['user_id'])) {
            echo "   User ID in session: " . $_SESSION['user_id'] . "\n";
            echo "   Authentication check: PASSED\n";
        } else {
            echo "   Authentication check: FAILED\n";
        }
        
        // Test 4: Check cookie headers
        echo "\n4. Cookie Information:\n";
        echo "   Session Name: " . session_name() . "\n";
        echo "   Cookie Params: " . print_r(session_get_cookie_params(), true) . "\n";
        
        // Test 5: Simulate what check-auth.php would do
        echo "\n5. Simulating check-auth.php:\n";
        if (isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
            $sql = "SELECT id, email, first_name, role, is_verified FROM users WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                echo "   Database verification: PASSED\n";
                echo "   User found: " . $user['email'] . " (Role: " . $user['role'] . ")\n";
                echo "   check-auth.php would return: {\"authenticated\":true}\n";
            } else {
                echo "   Database verification: FAILED - User not found\n";
            }
        } else {
            echo "   No user_id in session\n";
        }
        
    } else {
        echo "   Password verification: FAILED\n";
    }
} else {
    echo "   User not found\n";
}

$stmt->close();
$conn->close();

echo "\n=== Test Complete ===\n";
echo "If this test shows authentication works, the issue is likely:\n";
echo "1. Browser not storing cookies\n";
echo "2. Cross-origin cookie blocking\n";
echo "3. Session ID changing between requests\n";
?>
