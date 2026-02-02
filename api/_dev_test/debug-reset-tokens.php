<?php
require 'connection.php';

echo "=== Debug Password Reset Tokens ===\n";

// Check if table exists and has data
$sql = "SELECT COUNT(*) as count FROM password_reset_tokens";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
echo "Total tokens in database: " . $row['count'] . "\n\n";

// Show recent tokens
$sql = "SELECT prt.token, prt.expires_at, u.email, u.first_name 
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        ORDER BY prt.created_at DESC
        LIMIT 5";
        
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo "Recent tokens:\n";
    while ($row = $result->fetch_assoc()) {
        echo "Email: " . $row['email'] . "\n";
        echo "Token: " . $row['token'] . "\n";
        echo "Expires: " . $row['expires_at'] . "\n";
        echo "Expired: " . (new DateTime() > new DateTime($row['expires_at']) ? "YES" : "NO") . "\n";
        echo "---\n";
    }
} else {
    echo "No tokens found in database\n";
}

// Test token validation
$testToken = $_GET['token'] ?? '';
if ($testToken) {
    echo "\nTesting token: " . $testToken . "\n";
    
    $sql = "SELECT u.id, u.email, prt.token, prt.expires_at
            FROM password_reset_tokens prt
            JOIN users u ON prt.user_id = u.id
            WHERE prt.token = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $testToken);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo "RESULT: Token not found\n";
    } else {
        $data = $result->fetch_assoc();
        echo "RESULT: Token found\n";
        echo "User: " . $data['email'] . "\n";
        echo "Expires: " . $data['expires_at'] . "\n";
        echo "Expired: " . (new DateTime() > new DateTime($data['expires_at']) ? "YES" : "NO") . "\n";
    }
}

$conn->close();
?>
