<?php
/**
 * Get Quote Requests
 * Admin endpoint to fetch all quote requests
 */

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    sendError(401, 'Unauthorized');
}

if (($auth['role'] ?? '') !== 'admin') {
    sendError(403, 'Forbidden');
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(405, 'Method not allowed');
}

// Query parameters
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
        $whereConditions[] = 'qr.status = ?';
        $params[] = $status;
        $types .= 's';
    }

    if (!empty($search)) {
        $whereConditions[] = '(qr.request_number LIKE ? OR qr.customer_name LIKE ? OR qr.customer_email LIKE ?)';
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Total count
    $countQuery = "SELECT COUNT(*) as total FROM quote_requests qr {$whereClause}";
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $totalCount = (int)($countStmt->get_result()->fetch_assoc()['total'] ?? 0);
        $countStmt->close();
    } else {
        $row = $conn->query($countQuery);
        $totalCount = (int)($row->fetch_assoc()['total'] ?? 0);
    }

    // Data query
    $quotesQuery = "
        SELECT 
            qr.id,
            qr.request_number,
            qr.customer_name,
            qr.customer_email,
            qr.customer_phone,
            qr.appliances,
            qr.analysis_data,
            qr.status,
            qr.ai_quote_id,
            qr.created_at,
            qr.updated_at,
            q.file_path,
            q.is_ai_generated,
            q.reviewed_by,
            q.reviewed_at
        FROM quote_requests qr
        LEFT JOIN quotations q ON q.quote_number = qr.ai_quote_id
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

    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $analysisData = null;
        if ($row['analysis_data']) {
            $analysisData = json_decode($row['analysis_data'], true);
        }

        $requests[] = [
            'id' => (int)$row['id'],
            'request_number' => $row['request_number'],
            'customer_name' => $row['customer_name'],
            'customer_email' => $row['customer_email'],
            'customer_phone' => $row['customer_phone'],
            'appliances' => $row['appliances'],
            'analysis_data' => $analysisData,
            'status' => $row['status'],
            'ai_quote_id' => $row['ai_quote_id'],
            'has_ai_quote' => !empty($row['ai_quote_id']),
            'quote_file_path' => $row['file_path'],
            'is_ai_generated' => (bool)($row['is_ai_generated'] ?? false),
            'reviewed_by' => $row['reviewed_by'] ? (int)$row['reviewed_by'] : null,
            'reviewed_at' => $row['reviewed_at'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }
    $stmt->close();

    sendSuccess([
        'data' => $requests,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalCount,
            'pages' => (int)ceil($totalCount / $limit),
        ],
    ]);

} catch (Throwable $e) {
    error_log('getQuoteRequests error: ' . $e->getMessage());
    sendError(500, 'Failed to fetch quote requests');
}
