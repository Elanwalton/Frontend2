<?php
// Temporarily disable auth check for testing
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

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
        GROUP BY 
            p.id
        ORDER BY 
            is_low_stock DESC, 
            p.stock_quantity ASC
        LIMIT 10";
        
$result = $conn->query($sql);
$inventory = [];

while ($row = $result->fetch_assoc()) {
    $inventory[] = $row;
}

header('Content-Type: application/json');
echo json_encode($inventory);
$conn->close();
?>
