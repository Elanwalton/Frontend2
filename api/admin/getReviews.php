<?php
/**
 * getReviews.php
 * Fetch product reviews with filtering and moderation
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

// Get query parameters
$status = $_GET['status'] ?? 'all';
$rating = $_GET['rating'] ?? 'all';
$search = $_GET['search'] ?? '';
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

try {
    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    $types = '';
    
    if ($status !== 'all') {
        $whereConditions[] = "r.status = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    if ($rating !== 'all') {
        $whereConditions[] = "r.rating >= ? AND r.rating < ?";
        $params[] = (int)$rating;
        $params[] = (int)$rating + 1;
        $types .= 'ii';
    }
    
    if (!empty($search)) {
        $whereConditions[] = "(p.name LIKE ? OR r.customer_name LIKE ? OR r.comment LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countQuery = "
        SELECT COUNT(*) as total 
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        {$whereClause}
    ";
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
    } else {
        $totalCount = $conn->query($countQuery)->fetch_assoc()['total'];
    }
    
    // Get reviews
    $reviewsQuery = "
        SELECT 
            r.id,
            r.product_id,
            p.name as product_name,
            p.main_image_url as product_image,
            r.customer_name,
            r.customer_email,
            r.rating,
            r.title,
            r.comment,
            r.status,
            r.verified_purchase,
            r.helpful_count,
            r.admin_response,
            r.created_at
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        {$whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $conn->prepare($reviewsQuery);
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = [
            'id' => (int)$row['id'],
            'product_id' => (int)$row['product_id'],
            'product' => $row['product_name'],
            'product_image' => $row['product_image'],
            'customer' => $row['customer_name'],
            'email' => $row['customer_email'],
            'rating' => (float)$row['rating'],
            'title' => $row['title'],
            'comment' => $row['comment'],
            'status' => $row['status'],
            'verified' => (bool)$row['verified_purchase'],
            'helpful_count' => (int)$row['helpful_count'],
            'admin_response' => $row['admin_response'],
            'date' => $row['created_at']
        ];
    }
    
    // Get metrics
    $metricsQuery = "
        SELECT 
            COUNT(*) as total_reviews,
            COALESCE(AVG(rating), 0) as avg_rating,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reviews,
            SUM(CASE WHEN admin_response IS NOT NULL THEN 1 ELSE 0 END) as responded_reviews
        FROM reviews
    ";
    $metricsResult = $conn->query($metricsQuery);
    $metrics = $metricsResult->fetch_assoc();
    
    $responseRate = $metrics['total_reviews'] > 0 
        ? ($metrics['responded_reviews'] / $metrics['total_reviews']) * 100 
        : 0;
    
    $response = [
        'success' => true,
        'data' => $reviews,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$totalCount,
            'pages' => ceil($totalCount / $limit)
        ],
        'metrics' => [
            'total_reviews' => (int)$metrics['total_reviews'],
            'avg_rating' => round((float)$metrics['avg_rating'], 2),
            'pending_reviews' => (int)$metrics['pending_reviews'],
            'response_rate' => round($responseRate, 2)
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch reviews',
        'message' => $e->getMessage()
    ]);
}
