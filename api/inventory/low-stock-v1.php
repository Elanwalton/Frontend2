<?php
// api/inventory/low-stock-v1.php - Production-ready low stock endpoint
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
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 50;
    $urgency = isset($_GET['urgency']) ? $_GET['urgency'] : 'all'; // all, critical, warning
    $category = isset($_GET['category']) ? (int)$_GET['category'] : 0;
    
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $conditions = ['p.stock_quantity <= p.reorder_level', 'p.is_active = 1'];
    $params = [];
    $types = '';
    
    if ($urgency === 'critical') {
        $conditions[] = 'p.stock_quantity = 0';
    } elseif ($urgency === 'warning') {
        $conditions[] = 'p.stock_quantity > 0';
    }
    
    if ($category > 0) {
        $conditions[] = 'p.category_id = ?';
        $params[] = $category;
        $types .= 'i';
    }
    
    $whereClause = 'WHERE ' . implode(' AND ', $conditions);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id $whereClause";
    $stmt = $conn->prepare($countSql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'];
    
    // Get low stock items with urgency calculation
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
            (p.reorder_level - p.stock_quantity) as units_below_reorder,
            CASE 
                WHEN p.stock_quantity = 0 THEN 'critical'
                WHEN p.stock_quantity <= (p.reorder_level * 0.5) THEN 'critical'
                ELSE 'warning'
            END as urgency_level,
            (SELECT COUNT(*) FROM stock_movements WHERE product_id = p.id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as recent_movements,
            p.updated_at
        FROM 
            products p
        LEFT JOIN
            categories c ON p.category_id = c.id
        $whereClause
        ORDER BY 
            urgency_level DESC,
            (p.reorder_level - p.stock_quantity) DESC,
            p.name ASC
        LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    $lowStockItems = [];
    $criticalCount = 0;
    $warningCount = 0;
    $totalImpact = 0;
    $categories = [];
    
    while ($row = $stmt->get_result()->fetch_assoc()) {
        $item = [
            'id' => (int)$row['id'],
            'name' => htmlspecialchars($row['name']),
            'sku' => htmlspecialchars($row['sku']),
            'stock_quantity' => (int)$row['stock_quantity'],
            'reorder_level' => (int)$row['reorder_level'],
            'units_below_reorder' => (int)$row['units_below_reorder'],
            'price' => (float)$row['price'],
            'inventory_value' => (float)$row['inventory_value'],
            'category_name' => htmlspecialchars($row['category_name'] ?? 'Uncategorized'),
            'urgency_level' => $row['urgency_level'],
            'recent_movements' => (int)$row['recent_movements'],
            'updated_at' => $row['updated_at']
        ];
        
        $lowStockItems[] = $item;
        
        // Count urgency levels
        if ($item['urgency_level'] === 'critical') {
            $criticalCount++;
        } else {
            $warningCount++;
        }
        
        // Calculate total impact
        $totalImpact += $item['inventory_value'];
        
        // Track categories
        if ($item['category_name']) {
            $categories[] = $item['category_name'];
        }
    }
    
    // Get category breakdown
    $categoryBreakdown = [];
    foreach ($lowStockItems as $item) {
        $cat = $item['category_name'];
        if (!isset($categoryBreakdown[$cat])) {
            $categoryBreakdown[$cat] = [
                'name' => $cat,
                'count' => 0,
                'total_value' => 0,
                'critical_count' => 0
            ];
        }
        $categoryBreakdown[$cat]['count']++;
        $categoryBreakdown[$cat]['total_value'] += $item['inventory_value'];
        if ($item['urgency_level'] === 'critical') {
            $categoryBreakdown[$cat]['critical_count']++;
        }
    }
    
    // Sort categories by count
    usort($categoryBreakdown, fn($a, $b) => $b['count'] - $a['count']);
    
    sendSuccess([
        'items' => $lowStockItems,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'total_pages' => ceil($total / $limit)
        ],
        'summary' => [
            'total_low_stock_items' => (int)$total,
            'critical_items' => $criticalCount,
            'warning_items' => $warningCount,
            'total_impact' => $totalImpact,
            'categories_affected' => count(array_unique($categories)),
            'category_breakdown' => array_slice($categoryBreakdown, 0, 5) // Top 5 categories
        ],
        'filters' => [
            'urgency' => $urgency,
            'category' => $category
        ]
    ]);
    
} catch (Exception $e) {
    logError('Failed to fetch low stock items', ['error' => $e->getMessage()]);
    sendError('Failed to fetch low stock items', 500, $isProduction ? null : $e->getMessage());
}
?>
