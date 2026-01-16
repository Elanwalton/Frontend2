<?php
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


$sql = "SELECT 
            p.id, 
            p.name, 
            p.sku, 
            p.stock_quantity as current_quantity,
            p.reorder_level,
            p.price,
            (p.price * p.stock_quantity) as inventory_value,
            p.stock_quantity <= p.reorder_level as is_low_stock,
            c.name as category_name
        FROM 
            products p
        LEFT JOIN
            categories c ON p.category_id = c.id
        ORDER BY 
            is_low_stock DESC, 
            p.stock_quantity ASC";
        
try {
    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception("SQL Error: " . $conn->error);
    }
    
    $inventory = [];
    
    while ($row = $result->fetch_assoc()) {
        $inventory[] = $row;
    }
    
    echo json_encode($inventory);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'sql' => $sql
    ]);
}
?>
