<?php
/**
 * getPayments.php
 * Fetch payment transactions with filtering
 */

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get query parameters
$status = $_GET['status'] ?? 'all';
$method = $_GET['payment_method'] ?? $_GET['method'] ?? 'all';
$search = $_GET['search'] ?? '';
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(10, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

try {
    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    $types = '';
    
    if ($status !== 'all') {
        $whereConditions[] = "p.status = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    if ($method !== 'all') {
        $whereConditions[] = "p.payment_method = ?";
        $params[] = $method;
        $types .= 's';
    }
    
    if (!empty($search)) {
        $whereConditions[] = "(p.checkout_request_id LIKE ? OR p.customer_email LIKE ? OR p.customer_name LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM payments p {$whereClause}";
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
    } else {
        $totalCount = $conn->query($countQuery)->fetch_assoc()['total'];
    }
    
    // Get payments
    $paymentsQuery = "
        SELECT 
            p.id,
            p.checkout_request_id as transaction_id,
            p.order_id,
            o.order_number,
            p.amount,
            p.currency,
            p.payment_method,
            p.status,
            p.customer_email,
            p.customer_name,
            p.notes,
            p.created_at,
            p.processed_at
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        {$whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $conn->prepare($paymentsQuery);
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = [
            'id' => (int)$row['id'],
            'transaction_id' => $row['transaction_id'],
            'order_id' => $row['order_id'] ? (int)$row['order_id'] : null,
            'order_number' => $row['order_number'],
            'amount' => (float)$row['amount'],
            'currency' => $row['currency'],
            'method' => $row['payment_method'],
            'status' => $row['status'],
            'email' => $row['customer_email'],
            'customer' => $row['customer_name'],
            'notes' => $row['notes'],
            'date' => $row['created_at'],
            'processed_at' => $row['processed_at']
        ];
    }
    
    // Get metrics
    $metricsQuery = "
        SELECT 
            COUNT(*) as total_transactions,
            COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as total_successful,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
            COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as total_failed
        FROM payments p
        {$whereClause}
    ";
    
    if (!empty($whereConditions)) {
        $metricsStmt = $conn->prepare($metricsQuery);
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
        'data' => $payments,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$totalCount,
            'pages' => ceil($totalCount / $limit)
        ],
        'metrics' => [
            'total_transactions' => (int)$metrics['total_transactions'],
            'total_successful' => (float)$metrics['total_successful'],
            'total_pending' => (float)$metrics['total_pending'],
            'total_failed' => (float)$metrics['total_failed']
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch payments',
        'message' => $e->getMessage()
    ]);
}
