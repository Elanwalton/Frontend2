<?php
// api/admin/reviews.php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $conn = getDbConnection();
    
    // Get query parameters
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, min(100, intval($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    $status = $_GET['status'] ?? null;
    $rating = $_GET['rating'] ?? null;
    $search = $_GET['search'] ?? null;

    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    $types = '';

    if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
        $whereConditions[] = "r.status = ?";
        $params[] = $status;
        $types .= 's';
    }

    if ($rating && is_numeric($rating) && $rating >= 1 && $rating <= 5) {
        $whereConditions[] = "r.rating = ?";
        $params[] = $rating;
        $types .= 'i';
    }

    if ($search) {
        $whereConditions[] = "(p.name LIKE ? OR r.customer_name LIKE ? OR r.customer_email LIKE ? OR r.comment LIKE ?)";
        $searchParam = '%' . $search . '%';
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= 'ssss';
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Get total count
    $countSql = "
        SELECT COUNT(*) as total
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        $whereClause
    ";
    
    $countStmt = $conn->prepare($countSql);
    if (!empty($params)) {
        $countStmt->bind_param($types, ...$params);
    }
    $countStmt->execute();
    $totalReviews = $countStmt->get_result()->fetch_assoc()['total'];
    $totalPages = ceil($totalReviews / $limit);

    // Get reviews with pagination
    $sql = "
        SELECT 
            r.id,
            r.product_id,
            p.name as product_name,
            r.customer_name,
            r.customer_email,
            r.rating,
            r.comment as review_text,
            r.pros,
            r.cons,
            r.would_recommend,
            r.admin_response,
            r.created_at as date_submitted,
            r.status,
            r.verified_purchase
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        $whereClause
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = [
            'id' => $row['id'],
            'product_id' => $row['product_id'],
            'product_name' => $row['product_name'],
            'customer_name' => $row['customer_name'],
            'customer_email' => $row['customer_email'],
            'rating' => intval($row['rating']),
            'review_text' => $row['review_text'],
            'pros' => $row['pros'],
            'cons' => $row['cons'],
            'would_recommend' => (bool)$row['would_recommend'],
            'admin_response' => $row['admin_response'],
            'date_submitted' => $row['date_submitted'],
            'status' => $row['status'],
            'verified_purchase' => (bool)$row['verified_purchase']
        ];
    }

    echo json_encode([
        'success' => true,
        'reviews' => $reviews,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalReviews,
            'totalPages' => $totalPages
        ]
    ]);

    $stmt->close();
    $countStmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log('Reviews API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch reviews'
    ]);
}
?>
