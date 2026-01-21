<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

$productId = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
// Support Slug lookup if needed, but usually we have ID by the time we load details.
// Let's stick to ID for simplicity, as the frontend page has the ID.

if ($productId <= 0) {
    sendError(400, 'Invalid Product ID');
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

try {
    $sql = "SELECT 
        id, 
        customer_name, 
        rating, 
        comment, 
        created_at, 
        helpful_count, 
        pros, 
        cons, 
        would_recommend, 
        verified_purchase,
        images
    FROM reviews 
    WHERE product_id = ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $productId, $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        // Map DB columns to generic API response fields
        $row['author'] = $row['customer_name'];
        // Keep original fields for compatibility if needed, but the frontend expects 'author', 'rating', 'helpful', 'date'
        
        $row['date'] = date('F j, Y', strtotime($row['created_at']));
        $row['helpful'] = (int)$row['helpful_count'];
        
        // Parse JSON images if present
        if (!empty($row['images'])) {
            $parsedImages = json_decode($row['images'], true);
            $row['images'] = is_array($parsedImages) ? $parsedImages : [];
        } else {
            $row['images'] = [];
        }
        
        // Convert types
        $row['id'] = (int)$row['id'];
        $row['rating'] = (float)$row['rating'];
        $row['would_recommend'] = (bool)$row['would_recommend'];
        $row['verified_purchase'] = (bool)$row['verified_purchase'];
        
        $reviews[] = $row;
    }
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) as total FROM reviews WHERE product_id = ?";
    $countStmt = $conn->prepare($countSql);
    $countStmt->bind_param("i", $productId);
    $countStmt->execute();
    $countRow = $countStmt->get_result()->fetch_assoc();
    
    sendSuccess([
        'reviews' => $reviews,
        'pagination' => [
            'total' => (int)$countRow['total'],
            'limit' => $limit,
            'offset' => $offset
        ]
    ]);

} catch (Exception $e) {
    error_log("Get Reviews Error: " . $e->getMessage());
    sendError(500, 'Internal Server Error');
}
?>
