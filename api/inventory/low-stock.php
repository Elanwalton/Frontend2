<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

header('Content-Type: application/json');

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth || $auth['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit;
}

try {
    // Get low stock items (below or at reorder level)
    $sql = "
        SELECT 
            p.id,
            p.name,
            p.sku,
            p.stock_quantity,
            p.reorder_level,
            p.price,
            (p.price * p.stock_quantity) as inventory_value,
            c.name as category_name,
            (p.reorder_level - p.stock_quantity) as units_below_reorder
        FROM 
            products p
        LEFT JOIN
            categories c ON p.category_id = c.id
        WHERE 
            p.stock_quantity <= p.reorder_level
            AND p.status = 'published'
        ORDER BY 
            (p.reorder_level - p.stock_quantity) DESC,
            p.name ASC
    ";
    
    $result = $conn->query($sql);
    $lowStockItems = [];
    
    while ($row = $result->fetch_assoc()) {
        $lowStockItems[] = $row;
    }
    
    // Get summary
    $summary = [
        'total_low_stock_items' => count($lowStockItems),
        'total_impact' => array_sum(array_column($lowStockItems, 'inventory_value')),
        'categories_affected' => count(array_unique(array_column($lowStockItems, 'category_name')))
    ];
    
    echo json_encode([
        'summary' => $summary,
        'items' => $lowStockItems,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch low stock items',
        'details' => $e->getMessage()
    ]);
}