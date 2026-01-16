<?php
/**
 * getQuotes.php
 * Fetch quote requests with filtering
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
        $whereConditions[] = "qr.status = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    if (!empty($search)) {
        $whereConditions[] = "(qr.quote_number LIKE ? OR qr.customer_name LIKE ? OR qr.customer_email LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM quote_requests qr {$whereClause}";
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $totalCount = $countStmt->get_result()->fetch_assoc()['total'];
    } else {
        $totalCount = $conn->query($countQuery)->fetch_assoc()['total'];
    }
    
    // Get quotes
    $quotesQuery = "
        SELECT 
            qr.id,
            qr.quote_number,
            qr.customer_name,
            qr.customer_email,
            qr.customer_phone,
            qr.company_name,
            qr.description,
            qr.estimated_value,
            qr.status,
            qr.valid_until,
            qr.file_path,
            qr.notes,
            qr.created_at,
            qr.updated_at
        FROM quote_requests qr
        {$whereClause}
        ORDER BY qr.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $conn->prepare($quotesQuery);
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quotes = [];
    while ($row = $result->fetch_assoc()) {
        $quotes[] = [
            'id' => (int)$row['id'],
            'quote_number' => $row['quote_number'],
            'customer' => $row['customer_name'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
            'company' => $row['company_name'],
            'description' => $row['description'],
            'estimated_value' => $row['estimated_value'] ? (float)$row['estimated_value'] : null,
            'status' => $row['status'],
            'valid_until' => $row['valid_until'],
            'file_path' => $row['file_path'],
            'notes' => $row['notes'],
            'date' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    // Get metrics
    $metricsQuery = "
        SELECT 
            COUNT(*) as total_quotes,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_quotes,
            SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_quotes,
            COALESCE(SUM(CASE WHEN status = 'accepted' THEN estimated_value ELSE 0 END), 0) as total_value
        FROM quote_requests
    ";
    $metricsResult = $conn->query($metricsQuery);
    $metrics = $metricsResult->fetch_assoc();
    
    $conversionRate = $metrics['total_quotes'] > 0 
        ? ($metrics['accepted_quotes'] / $metrics['total_quotes']) * 100 
        : 0;
    
    $response = [
        'success' => true,
        'data' => $quotes,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$totalCount,
            'pages' => ceil($totalCount / $limit)
        ],
        'metrics' => [
            'total_quotes' => (int)$metrics['total_quotes'],
            'pending_quotes' => (int)$metrics['pending_quotes'],
            'conversion_rate' => round($conversionRate, 2),
            'total_value' => (float)$metrics['total_value']
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch quotes',
        'message' => $e->getMessage()
    ]);
}
