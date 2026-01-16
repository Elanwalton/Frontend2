<?php
require_once __DIR__ . '/../../ApiHelper.php';
require_once __DIR__ . '/../../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    // Get inventory stats
    $statsQuery = "
        SELECT 
            COUNT(*) as totalProducts,
            SUM(CASE WHEN stock_quantity < reorder_level THEN 1 ELSE 0 END) as lowStockItems,
            SUM(stock_quantity * price) as totalValue
        FROM products
    ";
    $statsResult = $conn->query($statsQuery);
    $stats = $statsResult->fetch_assoc();

    // Get low stock items
    $lowStockQuery = "
        SELECT 
            id,
            name,
            sku,
            stock_quantity,
            reorder_level,
            (reorder_level - stock_quantity) as units_below_reorder,
            category,
            price,
            (stock_quantity * price) as inventory_value
        FROM products
        WHERE stock_quantity < reorder_level
        ORDER BY units_below_reorder DESC
        LIMIT 10
    ";
    $lowStockResult = $conn->query($lowStockQuery);
    $lowStockItems = [];
    while ($row = $lowStockResult->fetch_assoc()) {
        $lowStockItems[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'sku' => $row['sku'],
            'stock_quantity' => (int)$row['stock_quantity'],
            'reorder_level' => (int)$row['reorder_level'],
            'units_below_reorder' => (int)$row['units_below_reorder'],
            'category_name' => $row['category'],
            'price' => (float)$row['price'],
            'inventory_value' => (float)$row['inventory_value']
        ];
    }

    // Get top products by inventory value
    $topProductsQuery = "
        SELECT 
            id,
            name,
            sku,
            stock_quantity as current_quantity,
            reorder_level,
            price,
            (stock_quantity * price) as inventory_value,
            CASE WHEN stock_quantity < reorder_level THEN true ELSE false END as is_low_stock,
            category
        FROM products
        ORDER BY inventory_value DESC
        LIMIT 10
    ";
    $topProductsResult = $conn->query($topProductsQuery);
    $topProducts = [];
    while ($row = $topProductsResult->fetch_assoc()) {
        $topProducts[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'sku' => $row['sku'],
            'current_quantity' => (int)$row['current_quantity'],
            'reorder_level' => (int)$row['reorder_level'],
            'price' => (float)$row['price'],
            'inventory_value' => (float)$row['inventory_value'],
            'is_low_stock' => (bool)$row['is_low_stock'],
            'category_name' => $row['category']
        ];
    }

    sendSuccess([
        'stats' => [
            'totalProducts' => (int)($stats['totalProducts'] ?? 0),
            'lowStockItems' => (int)($stats['lowStockItems'] ?? 0),
            'totalValue' => (float)($stats['totalValue'] ?? 0),
            'recentMovements' => 0
        ],
        'lowStockItems' => $lowStockItems,
        'topProducts' => $topProducts
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch inventory data',
        'message' => $e->getMessage()
    ]);
}
?>
