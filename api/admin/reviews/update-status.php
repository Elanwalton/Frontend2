<?php
// api/admin/reviews/update-status.php
require_once __DIR__ . '/../../ApiHelper.php';
require_once __DIR__ . '/../../auth-middleware.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $reviewId = $data['review_id'] ?? '';
    $status = $data['status'] ?? '';
    
    if (empty($reviewId) || empty($status)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Review ID and status are required']);
        exit;
    }
    
    if (!in_array($status, ['approved', 'rejected'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        exit;
    }
    
    $conn = getDbConnection();
    
    // Check if review exists
    $checkStmt = $conn->prepare('SELECT id, status FROM reviews WHERE id = ?');
    $checkStmt->bind_param('s', $reviewId);
    $checkStmt->execute();
    $existingReview = $checkStmt->get_result()->fetch_assoc();
    
    if (!$existingReview) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Review not found']);
        exit;
    }
    
    // Update review status
    $updateStmt = $conn->prepare('UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?');
    $updateStmt->bind_param('ss', $status, $reviewId);
    
    if ($updateStmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => "Review status updated to $status",
            'data' => [
                'review_id' => $reviewId,
                'old_status' => $existingReview['status'],
                'new_status' => $status
            ]
        ]);
    } else {
        throw new Exception('Failed to update review status');
    }
    
    $checkStmt->close();
    $updateStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Review Update Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update review status'
    ]);
}
?>
