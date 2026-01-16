<?php
// api/inventory/stock-levels-v1.php - Production-ready endpoint
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
    // Get query parameters with validation
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 50; // Max 100 items
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? (int)$_GET['category'] : 0;
    
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause for filtering
    $conditions = ['p.is_active = 1'];
    $params = [];
    $types = '';
    
    if (!empty($search)) {
        $conditions[] = '(p.name LIKE ? OR p.sku LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= 'ss';
    }
    
    if ($category > 0) {
        $conditions[] = 'p.category_id = ?';
        $params[] = $category;
        $types .= 'i';
    }
    
    $whereClause = 'WHERE ' . implode(' AND ', $conditions);
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) as total FROM products p $whereClause";
    $stmt = $conn->prepare($countSql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'];
    
    // Get products with stock levels
    $sql = "SELECT 
                p.id, 
                p.name, 
                p.sku, 
                p.stock_quantity as current_quantity,
                p.reorder_level,
                p.price,
                (p.price * p.stock_quantity) as inventory_value,
                COALESCE(SUM(CASE 
                    WHEN sm.movement_type = 'sale' THEN sm.quantity_change 
                    ELSE 0 
                END), 0) as total_sold,
                COALESCE(SUM(CASE 
                    WHEN sm.movement_type = 'purchase' THEN sm.quantity_change 
                    ELSE 0 
                END), 0) as total_purchased,
                c.name as category_name,
                (p.stock_quantity <= p.reorder_level) as is_low_stock,
                (SELECT COUNT(*) FROM stock_movements WHERE product_id = p.id) as movement_count
            FROM 
                products p
            LEFT JOIN 
                stock_movements sm ON p.id = sm.product_id
            LEFT JOIN 
                categories c ON p.category_id = c.id
            $whereClause
            GROUP BY p.id
            ORDER BY p.name ASC
            LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    $products = [];
    while ($row = $stmt->get_result()->fetch_assoc()) {
        $products[] = [
            'id' => (int)$row['id'],
            'name' => htmlspecialchars($row['name']),
            'sku' => htmlspecialchars($row['sku']),
            'current_quantity' => (int)$row['current_quantity'],
            'reorder_level' => (int)$row['reorder_level'],
            'price' => (float)$row['price'],
            'inventory_value' => (float)$row['inventory_value'],
            'total_sold' => (int)$row['total_sold'],
            'total_purchased' => (int)$row['total_purchased'],
            'category_name' => htmlspecialchars($row['category_name'] ?? 'Uncategorized'),
            'is_low_stock' => (bool)$row['is_low_stock'],
            'movement_count' => (int)$row['movement_count']
        ];
    }
    
    // Calculate summary statistics
    $totalValue = array_sum(array_column($products, 'inventory_value'));
    $lowStockCount = count(array_filter($products, fn($p) => $p['is_low_stock']));
    
    sendSuccess([
        'products' => $products,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'total_pages' => ceil($total / $limit)
        ],
        'summary' => [
            'total_products' => count($products),
            'total_inventory_value' => $totalValue,
            'low_stock_items' => $lowStockCount,
            'categories_count' => count(array_unique(array_column($products, 'category_name')))
        ]
    ]);
    
} catch (Exception $e) {
    logError('Failed to fetch stock levels', ['error' => $e->getMessage()]);
    sendError('Failed to fetch stock levels', 500, $isProduction ? null : $e->getMessage());
}
?>
