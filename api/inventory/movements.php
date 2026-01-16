// api/inventory/movements.php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$auth = $GLOBALS['_AUTH_USER'] ?? null;
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get query parameters
$productId = $_GET['product_id'] ?? null;
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

try {
    $whereClause = '';
    $params = [];
    $types = '';
    
    if ($productId) {
        $whereClause = 'WHERE sm.product_id = ?';
        $params[] = $productId;
        $types .= 'i';
    }
    
    // Get total count
    $countStmt = $conn->prepare("
        SELECT COUNT(*) as total 
        FROM stock_movements sm
        $whereClause
    ");
    
    if ($productId) {
        $countStmt->bind_param($types, ...$params);
    }
    
    $countStmt->execute();
    $total = $countStmt->get_result()->fetch_assoc()['total'];
    $totalPages = ceil($total / $limit);
    
    // Get paginated movements
    $sql = "
        SELECT 
            sm.*,
            p.name as product_name,
            p.sku as product_sku,
            u.username as created_by_name
        FROM 
            stock_movements sm
        JOIN 
            products p ON sm.product_id = p.id
        LEFT JOIN 
            users u ON sm.created_by = u.id
        $whereClause
        ORDER BY 
            sm.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $conn->prepare($sql);
    
    if ($productId) {
        $stmt->bind_param($types . 'ii', ...array_merge($params, [$limit, $offset]));
    } else {
        $stmt->bind_param('ii', $limit, $offset);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $movements = [];
    while ($row = $result->fetch_assoc()) {
        $row['created_at_formatted'] = date('M d, Y H:i', strtotime($row['created_at']));
        $row['movement_type_display'] = ucfirst($row['movement_type']);
        $movements[] = $row;
    }
    
    echo json_encode([
        'data' => $movements,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => $totalPages
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch stock movements',
        'details' => $e->getMessage()
    ]);
}