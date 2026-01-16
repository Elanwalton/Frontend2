<?php
// api/inventory/movements-v1.php - Production-ready movements endpoint
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

// Apply rate limiting
rateLimit(60, 60); // 60 requests per minute

// Require authentication
requireAuth();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    // Get and validate query parameters
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(max(1, (int)$_GET['limit']), 100) : 20;
    $offset = ($page - 1) * $limit;
    
    $productId = isset($_GET['product_id']) ? trim($_GET['product_id']) : '';
    $movementType = isset($_GET['movement_type']) ? $_GET['movement_type'] : '';
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : '';
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : '';
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    
    // Validate movement type
    $validTypes = ['purchase', 'sale', 'return', 'adjustment'];
    if (!empty($movementType) && !in_array($movementType, $validTypes)) {
        sendError('Invalid movement type', 400);
    }
    
    // Validate dates
    if (!empty($startDate) && !DateTime::createFromFormat('Y-m-d', $startDate)) {
        sendError('Invalid start date format', 400);
    }
    if (!empty($endDate) && !DateTime::createFromFormat('Y-m-d', $endDate)) {
        sendError('Invalid end date format', 400);
    }
    
    // Build WHERE clause
    $conditions = [];
    $params = [];
    $types = '';
    
    if (!empty($productId)) {
        $conditions[] = '(p.sku LIKE ? OR p.name LIKE ?)';
        $searchParam = "%$productId%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= 'ss';
    }
    
    if (!empty($movementType)) {
        $conditions[] = 'sm.movement_type = ?';
        $params[] = $movementType;
        $types .= 's';
    }
    
    if (!empty($startDate)) {
        $conditions[] = 'DATE(sm.created_at) >= ?';
        $params[] = $startDate;
        $types .= 's';
    }
    
    if (!empty($endDate)) {
        $conditions[] = 'DATE(sm.created_at) <= ?';
        $params[] = $endDate;
        $types .= 's';
    }
    
    if ($userId > 0) {
        $conditions[] = 'sm.created_by = ?';
        $params[] = $userId;
        $types .= 'i';
    }
    
    $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total 
                 FROM stock_movements sm 
                 LEFT JOIN products p ON sm.product_id = p.id 
                 $whereClause";
    
    $stmt = $conn->prepare($countSql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'];
    
    // Get movements with pagination
    $sql = "SELECT 
                sm.id,
                sm.product_id,
                sm.quantity_change,
                sm.movement_type,
                sm.reference_type,
                sm.reference_id,
                sm.notes,
                sm.created_at,
                p.name as product_name,
                p.sku as product_sku,
                u.username as created_by_name,
                CASE sm.movement_type
                    WHEN 'purchase' THEN 'Purchase'
                    WHEN 'sale' THEN 'Sale'
                    WHEN 'return' THEN 'Return'
                    WHEN 'adjustment' THEN 'Adjustment'
                    ELSE sm.movement_type
                END as movement_type_display
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
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    $movements = [];
    while ($row = $stmt->get_result()->fetch_assoc()) {
        $movements[] = [
            'id' => (int)$row['id'],
            'product_id' => (int)$row['product_id'],
            'product_name' => htmlspecialchars($row['product_name'] ?? 'Unknown'),
            'product_sku' => htmlspecialchars($row['product_sku'] ?? ''),
            'quantity_change' => (int)$row['quantity_change'],
            'movement_type' => $row['movement_type'],
            'movement_type_display' => $row['movement_type_display'],
            'reference_type' => $row['reference_type'] ? htmlspecialchars($row['reference_type']) : null,
            'reference_id' => $row['reference_id'] ? (int)$row['reference_id'] : null,
            'notes' => $row['notes'] ? htmlspecialchars($row['notes']) : null,
            'created_at' => $row['created_at'],
            'created_at_formatted' => date('M d, Y h:i A', strtotime($row['created_at'])),
            'created_by_name' => htmlspecialchars($row['created_by_name'] ?? 'System')
        ];
    }
    
    // Get movement statistics
    $statsSql = "SELECT 
                    COUNT(*) as total_movements,
                    SUM(CASE WHEN movement_type = 'sale' THEN quantity_change ELSE 0 END) as total_sold,
                    SUM(CASE WHEN movement_type = 'purchase' THEN quantity_change ELSE 0 END) as total_purchased,
                    COUNT(DISTINCT product_id) as products_affected,
                    COUNT(DISTINCT created_by) as users_active
                 FROM stock_movements sm 
                 LEFT JOIN products p ON sm.product_id = p.id 
                 $whereClause";
    
    $statsStmt = $conn->prepare($statsSql);
    if (!empty($params) && count($params) > 2) { // Remove limit and offset params
        $statsParams = array_slice($params, 0, -2);
        $statsTypes = substr($types, 0, -2);
        $statsStmt->bind_param($statsTypes, ...$statsParams);
    }
    $statsStmt->execute();
    $stats = $statsStmt->get_result()->fetch_assoc();
    
    // Get movement type breakdown
    $typeBreakdownSql = "SELECT 
                            movement_type,
                            COUNT(*) as count,
                            SUM(quantity_change) as total_quantity
                         FROM stock_movements sm 
                         LEFT JOIN products p ON sm.product_id = p.id 
                         $whereClause
                         GROUP BY movement_type";
    
    $typeStmt = $conn->prepare($typeBreakdownSql);
    if (!empty($params) && count($params) > 2) {
        $typeParams = array_slice($params, 0, -2);
        $typeTypes = substr($types, 0, -2);
        $typeStmt->bind_param($typeTypes, ...$typeParams);
    }
    $typeStmt->execute();
    $typeBreakdown = [];
    while ($row = $typeStmt->get_result()->fetch_assoc()) {
        $typeBreakdown[] = [
            'type' => $row['movement_type'],
            'count' => (int)$row['count'],
            'total_quantity' => (int)$row['total_quantity']
        ];
    }
    
    sendSuccess([
        'movements' => $movements,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'total_pages' => ceil($total / $limit)
        ],
        'statistics' => [
            'total_movements' => (int)$stats['total_movements'],
            'total_sold' => (int)$stats['total_sold'],
            'total_purchased' => (int)$stats['total_purchased'],
            'products_affected' => (int)$stats['products_affected'],
            'users_active' => (int)$stats['users_active'],
            'type_breakdown' => $typeBreakdown
        ],
        'filters_applied' => [
            'product_search' => $productId,
            'movement_type' => $movementType,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'user_id' => $userId
        ]
    ]);
    
} catch (Exception $e) {
    logError('Failed to fetch stock movements', ['error' => $e->getMessage()]);
    sendError('Failed to fetch stock movements', 500, $isProduction ? null : $e->getMessage());
}
?>
