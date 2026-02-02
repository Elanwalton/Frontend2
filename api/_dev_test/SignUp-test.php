<?php
// Minimal test version to isolate the issue
header('Content-Type: application/json');

try {
    error_log("=== SignUp Test Started ===");
    
    // Test basic includes one by one
    error_log("Testing cors.php...");
    require __DIR__ . '/cors.php';
    
    error_log("Testing connection.php...");
    require 'connection.php';
    
    error_log("All includes successful");
    
    // Test basic JSON decode
    $input = file_get_contents("php://input");
    error_log("Raw input: " . $input);
    
    $data = json_decode($input, true);
    error_log("Decoded data: " . print_r($data, true));
    
    echo json_encode([
        "success" => true,
        "message" => "Test successful",
        "received" => $data
    ]);
    
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
