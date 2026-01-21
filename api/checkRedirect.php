<?php
require_once 'config.php';

header('Content-Type: application/json');

$requestUri = isset($_GET['path']) ? $_GET['path'] : '';

if (empty($requestUri)) {
    echo json_encode(['success' => false, 'message' => 'Path is required']);
    exit;
}

// Normalize path (ensure leading slash, no trailing slash unless root)
$path = '/' . trim($requestUri, '/');
if ($path === '/') $path = '';

try {
    $conn = getDbConnection();
    
    // Check for exact match
    // We select the most specific active redirect
    $stmt = $conn->prepare("SELECT new_url, redirect_type FROM url_redirects WHERE old_url = ? AND status = 'active' LIMIT 1");
    $stmt->bind_param("s", $path);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $redirect = $result->fetch_assoc();
        
        // Log the hit (asynchronously if possible, but here synchronously for simplicity)
        $updateStmt = $conn->prepare("UPDATE url_redirects SET hit_count = hit_count + 1, last_accessed = NOW() WHERE old_url = ?");
        $updateStmt->bind_param("s", $path);
        $updateStmt->execute();
        
        echo json_encode([
            'success' => true, 
            'redirect' => true,
            'to' => $redirect['new_url'],
            'type' => intval($redirect['redirect_type'])
        ]);
    } else {
        echo json_encode(['success' => true, 'redirect' => false]);
    }

} catch (Exception $e) {
    error_log("Redirect Check Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
