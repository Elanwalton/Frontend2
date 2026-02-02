<?php
// Debug stock-levels.php
require_once __DIR__ . '/ApiHelper.php';

echo "Testing database connection...\n";

$conn = getDbConnection();

if (!$conn) {
    echo "Database connection failed\n";
    exit;
}

echo "Database connection successful\n";

// Test simple product count
$countSql = "SELECT COUNT(*) as count FROM products";
$result = $conn->query($countSql);
$row = $result->fetch_assoc();
echo "Total products: " . $row['count'] . "\n";

// Test stock-levels query
$sql = "SELECT 
            p.id, 
            p.name, 
            p.sku, 
            p.stock_quantity as current_quantity,
            p.reorder_level,
            p.price
        FROM 
            products p
        LIMIT 5";

$result = $conn->query($sql);
$products = [];

while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo "Sample products:\n";
print_r($products);

$conn->close();
?>
