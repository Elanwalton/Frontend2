<?php
// api/public-endpoints.php
// List of endpoints that should NOT require authentication
$public_endpoints = [
    'request-verification',
    'forgot-password', 
    'verify-email',
    'SignUp',
    'login',
    'check-auth'
];

// Function to check if current endpoint is public
function isPublicEndpoint($endpoint) {
    global $public_endpoints;
    
    // Extract endpoint name from request URI
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $endpoint_name = basename($request_uri, '.php');
    
    return in_array($endpoint_name, $public_endpoints);
}
?>
