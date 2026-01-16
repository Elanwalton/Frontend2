<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

header('Content-Type: application/json');

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

// Temporarily disable auth for testing
// if (!$auth || $auth['role'] !== 'admin') {
//     http_response_code(403);
//     echo json_encode(['success' => false, 'message' => 'Admin access required']);
//     exit;
// }

// Get pagination and filter parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;

$productId = isset($_GET['product_id']) ? $_GET['product_id'] : '';
$movementType = isset($_GET['movement_type']) ? $_GET['movement_type'] : '';
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : '';

// Build WHERE clause
$conditions = [];
$params = [];
$types = '';

if (!empty($productId)) {
    $conditions[] = "p.sku LIKE ?";
    $params[] = "%$productId%";
    $types .= 's';
}

if (!empty($movementType)) {
    $conditions[] = "sm.movement_type = ?";
    $params[] = $movementType;
    $types .= 's';
}

if (!empty($startDate)) {
    $conditions[] = "sm.created_at >= ?";
    $params[] = $startDate;
    $types .= 's';
}

if (!empty($endDate)) {
    $conditions[] = "sm.created_at <= ?";
    $params[] = $endDate . ' 23:59:59';
    $types .= 's';
}

$whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

// Get total count
$countSql = "SELECT COUNT(*) as total FROM stock_movements sm 
             LEFT JOIN products p ON sm.product_id = p.id
             LEFT JOIN users u ON sm.created_by = u.id $whereClause";
$stmt = $conn->prepare($countSql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$total = $stmt->get_result()->fetch_assoc()['total'];

// Get movements
$sql = "SELECT 
            sm.*,
            p.name as product_name,
            p.sku as product_sku,
            u.username as created_by_name,
            DATE_FORMAT(sm.created_at, '%M %d, %Y %h:%i %p') as created_at_formatted
        FROM 
            stock_movements sm
        LEFT JOIN 
            products p ON sm.product_id = p.id
        LEFT JOIN 
            users u ON sm.created_by = u.id
        $whereClause
        ORDER BY sm.created_at DESC
        LIMIT ? OFFSET ?";

$params[] = $limit;
$params[] = $offset;
$types .= 'ii';

try {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    $movements = [];
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $row['movement_type_display'] = ucfirst($row['movement_type']);
        $movements[] = $row;
    }
    
    echo json_encode([
        'movements' => $movements,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'sql' => $sql
    ]);
}
?>
