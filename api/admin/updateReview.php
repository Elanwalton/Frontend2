<?php
/**
 * updateReview.php
 * Approve, reject, or respond to reviews
 */

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$reviewId = $input['review_id'] ?? null;
$action = $input['action'] ?? null; // 'approve', 'reject', 'respond'
$response = $input['response'] ?? null;

if (!$reviewId || !$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $conn->begin_transaction();
    
    if ($action === 'approve') {
        $stmt = $conn->prepare("UPDATE reviews SET status = 'approved', updated_at = NOW() WHERE id = ?");
        $stmt->bind_param('i', $reviewId);
        $stmt->execute();
        
    } elseif ($action === 'reject') {
        $stmt = $conn->prepare("UPDATE reviews SET status = 'rejected', updated_at = NOW() WHERE id = ?");
        $stmt->bind_param('i', $reviewId);
        $stmt->execute();
        
    } elseif ($action === 'respond') {
        $stmt = $conn->prepare("
            UPDATE reviews 
            SET admin_response = ?, 
                responded_by = ?, 
                responded_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        ");
        $userId = (int)$auth['id'];
        $stmt->bind_param('sii', $response, $userId, $reviewId);
        $stmt->execute();
        
    } else {
        throw new Exception('Invalid action');
    }
    
    // Log activity
    $logStmt = $conn->prepare("
        INSERT INTO admin_activity_log 
        (user_id, action, entity_type, entity_id, description, ip_address) 
        VALUES (?, ?, 'review', ?, ?, ?)
    ");
    $userId = (int)$auth['id'];
    $actionDesc = "Review {$action}";
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $logStmt->bind_param('isiss', $userId, $actionDesc, $reviewId, $actionDesc, $ipAddress);
    
    // Check if table exists before logging (safeguard)
    $tableCheck = $conn->query("SHOW TABLES LIKE 'admin_activity_log'");
    if ($tableCheck->num_rows > 0) {
        $logStmt->execute();
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Review updated successfully'
    ]);
    
} catch (Exception $e) {
    if ($conn) $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update review',
        'message' => $e->getMessage()
    ]);
}
?>
