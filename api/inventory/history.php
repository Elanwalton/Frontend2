// api/inventory/history.php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../auth-middleware.php';

$auth = $GLOBALS['_AUTH_USER'] ?? null;
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    // Get query parameters
    $productId = $_GET['product_id'] ?? null;
    $startDate = $_GET['start_date'] ?? date('Y-m-01');
    $endDate = $_GET['end_date'] ?? date('Y-m-t');
    $movementType = $_GET['type'] ?? null;
    
    // Build WHERE clause
    $where = ["DATE(sm.created_at) BETWEEN ? AND ?"];
    $params = [$startDate, $endDate];
    $types = "ss";
    
    if ($productId) {
        $where[] = "sm.product_id = ?";
        $params[] = $productId;
        $types .= "i";
    }
    
    if ($movementType) {
        $where[] = "sm.movement_type = ?";
        $params[] = $movementType;
        $types .= "s";
    }
    
    $whereClause = implode(" AND ", $where);
    
    // Get inventory movements
    $sql = "
        SELECT 
            sm.*,
            p.name as product_name,
            p.sku as product_sku,
            u.username as created_by_name,
            DATE(sm.created_at) as movement_date
        FROM 
            stock_movements sm
        JOIN 
            products p ON sm.product_id = p.id
        LEFT JOIN 
            users u ON sm.created_by = u.id
        WHERE 
            $whereClause
        ORDER BY 
            sm.created_at DESC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $movements = [];
    while ($row = $result->fetch_assoc()) {
        $movements[] = $row;
    }
    
    // Group by date for the timeline view
    $groupedByDate = [];
    foreach ($movements as $movement) {
        $date = $movement['movement_date'];
        if (!isset($groupedByDate[$date])) {
            $groupedByDate[$date] = [
                'date' => $date,
                'movements' => []
            ];
        }
        $groupedByDate[$date]['movements'][] = $movement;
    }
    
    // Convert to indexed array for JSON
    $timeline = array_values($groupedByDate);
    
    echo json_encode([
        'timeline' => $timeline,
        'total_movements' => count($movements),
        'date_range' => [
            'start' => $startDate,
            'end' => $endDate
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch inventory history',
        'details' => $e->getMessage()
    ]);
}