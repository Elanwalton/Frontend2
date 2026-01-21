
<?php
/**
 * getOrders.php
 * Fetch orders with filtering, pagination, and search
 */
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

// Get query parameters
$status = $_GET['status'] ?? 'all';
$search = $_GET['search'] ?? '';
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$sortBy = $_GET['sort_by'] ?? 'created_at';
$sortOrder = strtoupper($_GET['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

// Check cache first (30 second TTL)
$cacheKey = CacheHelper::generateKey('orders', [
    'status' => $status,
    'search' => $search,
    'page' => $page,
    'limit' => $limit,
    'sort_by' => $sortBy,
    'sort_order' => $sortOrder
]);

$cachedData = CacheHelper::get($cacheKey);
if ($cachedData !== null) {
    echo json_encode($cachedData);
    exit;
}

try {
    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    $types = '';
    
    if ($status !== 'all') {
        $whereConditions[] = "o.status = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    if (!empty($search)) {
        $whereConditions[] = "(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM orders o {$whereClause}";
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
    } else {
        $totalCount = $conn->query($countQuery)->fetch_assoc()['total'];
    }
    
    // Validate sort column
    $allowedSortColumns = ['order_number', 'customer_name', 'total_amount', 'status', 'created_at'];
    if (!in_array($sortBy, $allowedSortColumns)) {
        $sortBy = 'created_at';
    }
    
    // Get orders with items count
    $ordersQuery = "
        SELECT 
            o.id,
            o.order_number,
            o.customer_name,
            o.customer_email,
            o.customer_phone,
            o.total_amount,
            o.status,
            o.payment_status,
            o.payment_method,
            o.tracking_number,
            o.carrier,
            o.estimated_delivery,
            o.created_at,
            o.updated_at,
            COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        {$whereClause}
        GROUP BY o.id
        ORDER BY o.{$sortBy} {$sortOrder}
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $conn->prepare($ordersQuery);
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'id' => (int)$row['id'],
            'order_number' => $row['order_number'],
            'customer' => $row['customer_name'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
            'amount' => (float)$row['total_amount'],
            'status' => $row['status'],
            'payment_status' => $row['payment_status'],
            'payment_method' => $row['payment_method'],
            'tracking_number' => $row['tracking_number'],
            'carrier' => $row['carrier'],
            'estimated_delivery' => $row['estimated_delivery'],
            'items' => (int)$row['items_count'],
            'date' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    // Get metrics for the current filter
    $metricsQuery = "
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_value,
            COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders o
        {$whereClause}
    ";
    
    if (!empty($whereConditions)) {
        $metricsStmt = $conn->prepare($metricsQuery);
        // Remove the limit and offset params for metrics
        $metricsTypes = substr($types, 0, -2);
        $metricsParams = array_slice($params, 0, -2);
        if (!empty($metricsParams)) {
            $metricsStmt->bind_param($metricsTypes, ...$metricsParams);
        }
        $metricsStmt->execute();
        $metrics = $metricsStmt->get_result()->fetch_assoc();
    } else {
        $metrics = $conn->query($metricsQuery)->fetch_assoc();
    }
    
    $response = [
        'success' => true,
        'data' => $orders,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$totalCount,
            'pages' => ceil($totalCount / $limit)
        ],
        'metrics' => [
            'total_orders' => (int)$metrics['total_orders'],
            'total_value' => (float)$metrics['total_value'],
            'avg_order_value' => (float)$metrics['avg_order_value']
        ]
    ];
    
    // Cache the response for 30 seconds
    CacheHelper::set($cacheKey, $response, 30);
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch orders',
        'message' => $e->getMessage()
    ]);
}
