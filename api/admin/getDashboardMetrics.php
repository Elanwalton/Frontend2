<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';
require_once __DIR__ . '/../CacheHelper.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $auth['id'];
// Get date range from query params
$startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate = $_GET['end_date'] ?? date('Y-m-d');

// Check cache first (60 second TTL)
$cacheKey = CacheHelper::generateKey('dashboard_metrics', [
    'start' => $startDate,
    'end' => $endDate
]);

$cachedData = CacheHelper::get($cacheKey);
if ($cachedData !== null) {
    echo json_encode($cachedData);
    exit;
}

try {
    // Calculate total revenue and order stats
    // Business rules:
    // - total_revenue: only count orders as revenue once they are fully completed/paid
    // - total_orders: count all non-cancelled, non-refunded orders for volume tracking
    $revenueQuery = "
        SELECT 
            COALESCE(SUM(CASE WHEN status IN ('completed', 'shipped', 'delivered') THEN total_amount ELSE 0 END), 0) as total_revenue,
            COUNT(CASE WHEN status NOT IN ('cancelled', 'refunded') THEN 1 END) as total_orders,
            COALESCE(AVG(CASE WHEN status IN ('completed', 'shipped', 'delivered') THEN total_amount END), 0) as avg_order_value
        FROM orders 
        WHERE created_at BETWEEN ? AND ?
    ";
    $stmt = $conn->prepare($revenueQuery);
    $stmt->bind_param('ss', $startDate, $endDate);
    $stmt->execute();
    $revenueData = $stmt->get_result()->fetch_assoc();
    
    // Get previous period for comparison
    $prevStart = date('Y-m-d', strtotime($startDate . ' -' . (strtotime($endDate) - strtotime($startDate)) . ' seconds'));
    $prevEnd = date('Y-m-d', strtotime($startDate . ' -1 day'));
    
    $stmt->bind_param('ss', $prevStart, $prevEnd);
    $stmt->execute();
    $prevRevenueData = $stmt->get_result()->fetch_assoc();
    
    // Calculate revenue change percentage
    $revenueChange = 0;
    if ($prevRevenueData['total_revenue'] > 0) {
        $revenueChange = (($revenueData['total_revenue'] - $prevRevenueData['total_revenue']) / $prevRevenueData['total_revenue']) * 100;
    }
    
    // Calculate orders change percentage
    $ordersChange = 0;
    if ($prevRevenueData['total_orders'] > 0) {
        $ordersChange = (($revenueData['total_orders'] - $prevRevenueData['total_orders']) / $prevRevenueData['total_orders']) * 100;
    }
    
    // Get sparkline data for revenue (last 40 days, only completed/paid orders)
    $sparklineQuery = "
        SELECT 
            DATE(created_at) as date,
            SUM(total_amount) as daily_revenue
        FROM orders
        WHERE created_at >= DATE_SUB(?, INTERVAL 40 DAY)
        AND status IN ('completed', 'shipped', 'delivered')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ";
    $stmt = $conn->prepare($sparklineQuery);
    $stmt->bind_param('s', $endDate);
    $stmt->execute();
    $sparklineResult = $stmt->get_result();
    
    $revenueSparkline = [];
    while ($row = $sparklineResult->fetch_assoc()) {
        $revenueSparkline[] = (float)$row['daily_revenue'];
    }
    
    // Get orders sparkline
    $ordersSparklineQuery = "
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as daily_orders
        FROM orders
        WHERE created_at >= DATE_SUB(?, INTERVAL 40 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ";
    $stmt = $conn->prepare($ordersSparklineQuery);
    $stmt->bind_param('s', $endDate);
    $stmt->execute();
    $ordersSparklineResult = $stmt->get_result();
    
    $ordersSparkline = [];
    while ($row = $ordersSparklineResult->fetch_assoc()) {
        $ordersSparkline[] = (int)$row['daily_orders'];
    }
    
    // Calculate conversion rate (orders / unique visitors)
    // For now, use a mock calculation - integrate with analytics later
    $conversionRate = 3.2;
    $conversionChange = 12;
    
    // Get average order value
    $avgOrderValue = $revenueData['avg_order_value'];
    $avgOrderChange = 0;
    if ($prevRevenueData['avg_order_value'] > 0) {
        $avgOrderChange = (($avgOrderValue - $prevRevenueData['avg_order_value']) / $prevRevenueData['avg_order_value']) * 100;
    }
    
    // Get orders by status for the selected period
    $statusQuery = "
        SELECT 
            status,
            COUNT(*) as count,
            SUM(total_amount) as total
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY status
    ";
    $stmt = $conn->prepare($statusQuery);
    $stmt->bind_param('ss', $startDate, $endDate);
    $stmt->execute();
    $statusResult = $stmt->get_result();
    
    $ordersByStatus = [];
    while ($row = $statusResult->fetch_assoc()) {
        $ordersByStatus[] = [
            'status' => $row['status'],
            'count' => (int)$row['count'],
            'total' => (float)$row['total']
        ];
    }
    
    // Get best selling products - only from completed/paid orders
    $bestSellersQuery = "
        SELECT 
            p.id,
            p.name,
            p.main_image_url,
            SUM(oi.quantity) as units_sold,
            SUM(oi.total_price) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN ? AND ?
        AND o.status IN ('completed', 'shipped', 'delivered')
        GROUP BY p.id, p.name, p.main_image_url
        ORDER BY units_sold DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($bestSellersQuery);
    $stmt->bind_param('ss', $startDate, $endDate);
    $stmt->execute();
    $bestSellersResult = $stmt->get_result();
    
    $bestSellers = [];
    while ($row = $bestSellersResult->fetch_assoc()) {
        $bestSellers[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'image' => $row['main_image_url'],
            'units_sold' => (int)$row['units_sold'],
            'revenue' => (float)$row['revenue']
        ];
    }
    
    // Get low stock products
    $lowStockQuery = "
        SELECT 
            id,
            name,
            stock_quantity,
            reorder_level,
            main_image_url,
            CASE 
                WHEN stock_quantity = 0 THEN 'out_of_stock'
                WHEN stock_quantity <= reorder_level THEN 'low_stock'
                WHEN stock_quantity <= (reorder_level * 2) THEN 'warning'
                ELSE 'in_stock'
            END as stock_status
        FROM products
        WHERE stock_quantity <= (COALESCE(reorder_level, 10))
        ORDER BY stock_quantity ASC
        LIMIT 5
    ";
    $lowStockResult = $conn->query($lowStockQuery);
    
    $lowStock = [];
    while ($row = $lowStockResult->fetch_assoc()) {
        $lowStock[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'stock' => (int)$row['stock_quantity'],
            'reorder_level' => (int)$row['reorder_level'],
            'image' => $row['main_image_url'],
            'stock_status' => $row['stock_status']
        ];
    }
    
    // Get recent orders
    $recentOrdersQuery = "
        SELECT 
            id,
            order_number,
            customer_name,
            customer_email,
            total_amount,
            status,
            created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5
    ";
    $recentOrdersResult = $conn->query($recentOrdersQuery);
    
    $recentOrders = [];
    while ($row = $recentOrdersResult->fetch_assoc()) {
        $recentOrders[] = [
            'id' => (int)$row['id'],
            'order_number' => $row['order_number'],
            'customer' => $row['customer_name'],
            'email' => $row['customer_email'],
            'amount' => (float)$row['total_amount'],
            'status' => $row['status'],
            'date' => $row['created_at']
        ];
    }

    // Cart abandonment metrics (requires product_analytics events)
    $cartMetrics = [
        'add_to_cart' => 0,
        'purchase' => 0,
    ];

    if ($stmt = $conn->prepare("SELECT event_type, SUM(event_count) as total FROM product_analytics WHERE event_date BETWEEN ? AND ? AND event_type IN ('add_to_cart', 'purchase') GROUP BY event_type")) {
        $stmt->bind_param('ss', $startDate, $endDate);
        $stmt->execute();
        $cartResult = $stmt->get_result();

        while ($row = $cartResult->fetch_assoc()) {
            $type = $row['event_type'];
            $cartMetrics[$type] = (int)$row['total'];
        }
        $stmt->close();
    }

    $totalAdds = $cartMetrics['add_to_cart'];
    $totalPurchases = $cartMetrics['purchase'];
    $abandonedCarts = max($totalAdds - $totalPurchases, 0);
    $completedCarts = $totalPurchases;

    $abandonmentRate = $totalAdds > 0 ? (($abandonedCarts / $totalAdds) * 100) : 0;
    $potentialRevenue = max($abandonedCarts * (float)$revenueData['avg_order_value'], 0);
    $convertedRevenue = $completedCarts * (float)$revenueData['avg_order_value'];

    // Prepare response
    $response = [
        'success' => true,
        'date_range' => [
            'start' => $startDate,
            'end' => $endDate
        ],
        'metrics' => [
            'total_revenue' => [
                'value' => (float)$revenueData['total_revenue'],
                'change' => round($revenueChange, 2),
                'trend' => $revenueChange >= 0 ? 'up' : 'down',
                'sparkline' => $revenueSparkline
            ],
            'total_orders' => [
                'value' => (int)$revenueData['total_orders'],
                'change' => round($ordersChange, 2),
                'trend' => $ordersChange >= 0 ? 'up' : 'down',
                'sparkline' => $ordersSparkline
            ],
            'conversion_rate' => [
                'value' => $conversionRate,
                'change' => $conversionChange,
                'trend' => 'up'
            ],
            'avg_order_value' => [
                'value' => (float)$avgOrderValue,
                'change' => round($avgOrderChange, 2),
                'trend' => $avgOrderChange >= 0 ? 'up' : 'down'
            ]
        ],
        'orders_by_status' => $ordersByStatus,
        'best_sellers' => $bestSellers,
        'low_stock' => $lowStock,
        'recent_orders' => $recentOrders,
        'cart_abandonment' => [
            'abandonment_rate' => round($abandonmentRate, 2),
            'abandoned_carts' => $abandonedCarts,
            'completed_carts' => $completedCarts,
            'potential_revenue' => round($potentialRevenue, 2),
            'converted_revenue' => round($convertedRevenue, 2)
        ]
    ];
    
    // Cache the response for 60 seconds
    CacheHelper::set($cacheKey, $response, 60);
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch dashboard metrics',
        'message' => $e->getMessage()
    ]);
}
?>
