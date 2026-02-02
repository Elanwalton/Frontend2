<?php
header('Content-Type: application/json');

try {
    error_log("=== SignUp Debug Started ===");
    
    // Test includes one by one
    error_log("Testing cors.php...");
    require __DIR__ . '/cors.php';
    
    error_log("Testing connection.php...");
    require 'connection.php';
    
    error_log("Testing mail-config.php...");
    require 'mail-config.php';
    
    error_log("Testing PasswordValidator.php...");
    require 'PasswordValidator.php';
    
    error_log("Testing PHPMailer includes...");
    require 'PHPMailer-master/src/PHPMailer.php';
    require 'PHPMailer-master/src/SMTP.php';
    require 'PHPMailer-master/src/Exception.php';
    
    error_log("All includes successful!");
    
    // Test basic functionality
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    echo json_encode([
        "success" => true,
        "message" => "All includes successful, ready for full logic",
        "received" => $data
    ]);
    
} catch (Exception $e) {
    error_log("Exception in debug: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Error in debug: " . $e->getMessage()
    ]);
}
?>
