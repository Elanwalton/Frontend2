<?php
require_once __DIR__ . '/ApiHelper.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method Not Allowed');
}

$conn = getDbConnection();
$data = getJsonInput();

// Validate required fields
$required = ['product_id', 'author', 'rating', 'comment'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        sendError(400, "Missing required field: $field");
    }
}

$productId = intval($data['product_id']);
$author = trim($data['author']);
$rating = floatval($data['rating']);
$comment = trim($data['comment']);
$pros = isset($data['pros']) ? trim($data['pros']) : null;
$cons = isset($data['cons']) ? trim($data['cons']) : null;
$wouldRecommend = isset($data['would_recommend']) ? (bool)$data['would_recommend'] : true;

// Basic validation
if ($rating < 1 || $rating > 5) {
    sendError(400, 'Rating must be between 1 and 5');
}

if (strlen($author) < 2) {
    sendError(400, 'Name is too short');
}

try {
    // 1. Insert Review
    $sql = "INSERT INTO reviews (
        product_id, 
        customer_name, 
        rating, 
        comment, 
        pros, 
        cons, 
        would_recommend,
        verified_purchase,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())";
    
    $stmt = $conn->prepare($sql);
    
    // Bind params: product_id (i), customer_name (s), rating (d), comment (s), pros (s), cons (s), would_recommend (i)
    $recommendInt = $wouldRecommend ? 1 : 0;
    
    $stmt->bind_param("isdsssi", $productId, $author, $rating, $comment, $pros, $cons, $recommendInt);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to save review: " . $stmt->error);
    }
    
    $reviewId = $stmt->insert_id;
    
    // 2. Update Product Aggregates (Rating & Count)
    // Recalculate average rating and count
    $aggSql = "SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = ?";
    $aggStmt = $conn->prepare($aggSql);
    $aggStmt->bind_param("i", $productId);
    $aggStmt->execute();
    $result = $aggStmt->get_result();
    $row = $result->fetch_assoc();
    
    $newCount = $row['count'];
    $newRating = $row['avg_rating'];
    
    // Update products table (products uses 'rating', 'review_count')
    $updateSql = "UPDATE products SET rating = ?, review_count = ? WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("dii", $newRating, $newCount, $productId);
    $updateStmt->execute();
    
    sendSuccess([
        'message' => 'Review submitted successfully',
        'review_id' => $reviewId,
        'new_product_rating' => $newRating,
        'new_review_count' => $newCount
    ]);

    // 3. Notify Admins
    if ($reviewId) {
        require_once __DIR__ . '/NotificationService.php';
        NotificationService::broadcastToAdmins(
            $conn,
            'review', // This will map to 'review_notifications' setting
            'New Review Received',
            "{$author} left a {$rating}-star review.",
            '/admin-dashboard/reviews'
        );
    }

} catch (Exception $e) {
    error_log("Submit Review Error: " . $e->getMessage());
    sendError(500, 'Internal Server Error');
}
?>
