<?php
// Simple working version
require __DIR__ . '/cors.php';
require 'connection.php';

header('Content-Type: application/json');

try {
    error_log("=== Simple SignUp Started ===");
    
    // Get and decode JSON
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid JSON input"]);
        exit;
    }
    
    $first_name = trim($data["firstName"] ?? '');
    $second_name = trim($data["secondName"] ?? '');
    $email = trim($data["email"] ?? '');
    $password = $data["password"] ?? '';
    
    error_log("Received data: " . print_r($data, true));
    
    // Basic validation
    if (empty($first_name) || empty($second_name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "All fields are required"]);
        exit;
    }
    
    // Check for duplicate email
    $checkSql = "SELECT * FROM users WHERE email = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email already exists"]);
        exit;
    }
    
    // Insert user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (first_name, second_name, email, password, is_verified) VALUES (?, ?, ?, ?, 0)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $first_name, $second_name, $email, $hashedPassword);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to create user account");
    }
    
    $userId = $conn->insert_id;
    error_log("User created with ID: " . $userId);
    
    // Generate verification token
    $verificationToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    $tokenSql = "INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
    $tokenStmt = $conn->prepare($tokenSql);
    $tokenStmt->bind_param("iss", $userId, $verificationToken, $expiresAt);
    
    if (!$tokenStmt->execute()) {
        throw new Exception("Failed to generate verification token");
    }
    
    error_log("Verification token created");
    
    // Close statements
    $checkStmt->close();
    $stmt->close();
    $tokenStmt->close();
    $conn->close();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful! Please check your email to verify your account.",
        "requiresVerification" => true
    ]);
    
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
