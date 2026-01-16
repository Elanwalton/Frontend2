<?php
require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth-middleware.php';

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
$sortBy = $_GET['sort_by'] ?? 'created_at';
$sortOrder = strtoupper($_GET['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

try {
    $allowedStatuses = ['all', 'pending', 'accepted', 'expired', 'rejected'];
    if (!in_array($status, $allowedStatuses, true)) {
        sendError(400, 'Invalid status');
    }

    // Validate sort column
    $allowedSortColumns = ['quote_number', 'customer_name', 'customer_email', 'status', 'created_at', 'expiry_date'];
    if (!in_array($sortBy, $allowedSortColumns, true)) {
        $sortBy = 'created_at';
    }

    // Build WHERE clause
    $whereConditions = [];
    $params = [];
    $types = '';

    if ($status !== 'all') {
        $whereConditions[] = 'q.status = ?';
        $params[] = $status;
        $types .= 's';
    }

    if (!empty($search)) {
        $whereConditions[] = '(q.quote_number LIKE ? OR q.customer_name LIKE ? OR q.customer_email LIKE ?)';
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Total count
    $countQuery = "SELECT COUNT(*) as total FROM quotations q {$whereClause}";
    if (!empty($params)) {
        $countStmt = $conn->prepare($countQuery);
        if (!$countStmt) {
            throw new Exception('DB prepare failed (count): ' . $conn->error);
        }
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $totalCount = (int)($countStmt->get_result()->fetch_assoc()['total'] ?? 0);
        $countStmt->close();
    } else {
        $row = $conn->query($countQuery);
        if (!$row) {
            throw new Exception('DB query failed (count): ' . $conn->error);
        }
        $totalCount = (int)($row->fetch_assoc()['total'] ?? 0);
    }

    // Detect which columns exist (support older schemas)
    $hasId = false;
    $hasQuoteId = false;
    $hasExpiryDate = false;
    $hasStatus = false;
    $hasTax = false;
    
    if ($colRes = $conn->query("SHOW COLUMNS FROM quotations")) {
        while ($c = $colRes->fetch_assoc()) {
            $field = $c['Field'] ?? '';
            if ($field === 'id') $hasId = true;
            if ($field === 'quote_id') $hasQuoteId = true;
            if ($field === 'expiry_date') $hasExpiryDate = true;
            if ($field === 'status') $hasStatus = true;
            if ($field === 'tax') $hasTax = true;
        }
    }

    // Data query
    $selectParts = [];
    if ($hasId) {
        $selectParts[] = 'q.id AS id';
    } elseif ($hasQuoteId) {
        $selectParts[] = 'q.quote_id AS id';
    } else {
        $selectParts[] = 'NULL AS id';
    }
    $selectParts[] = 'q.quote_number';
    $selectParts[] = 'q.customer_name';
    $selectParts[] = 'q.customer_email';
    $selectParts[] = 'q.file_path';
    $selectParts[] = 'q.created_at';
    $selectParts[] = ($hasExpiryDate ? 'q.expiry_date' : 'NULL AS expiry_date');
    $selectParts[] = ($hasStatus ? 'q.status' : "'pending' AS status");

    // Aggregates from quote_items (quote_items.quote_id stores quote_number in this project)
    $selectParts[] = 'COALESCE(qi.item_count, 0) AS item_count';
    $selectParts[] = 'COALESCE(qi.subtotal, 0) AS subtotal';

    // VAT/tax is optional. If quotations.tax exists, use it; otherwise default to 0.
    if ($hasTax) {
        $selectParts[] = 'COALESCE(q.tax, 0) AS tax_rate';
        $selectParts[] = 'ROUND((COALESCE(qi.subtotal, 0) * COALESCE(q.tax, 0)) / 100, 2) AS tax';
        $selectParts[] = 'ROUND(COALESCE(qi.subtotal, 0) + ((COALESCE(qi.subtotal, 0) * COALESCE(q.tax, 0)) / 100), 2) AS total';
    } else {
        $selectParts[] = '0 AS tax_rate';
        $selectParts[] = '0 AS tax';
        $selectParts[] = 'ROUND(COALESCE(qi.subtotal, 0), 2) AS total';
    }

    $quotesQuery = "SELECT\n            " . implode(",\n            ", $selectParts) . "\n        FROM quotations q\n        LEFT JOIN (\n            SELECT\n                quote_id,\n                COUNT(*) AS item_count,\n                SUM(quantity * unit_price) AS subtotal\n            FROM quote_items\n            GROUP BY quote_id\n        ) qi ON qi.quote_id = q.quote_number\n        {$whereClause}\n        ORDER BY q.{$sortBy} {$sortOrder}\n        LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($quotesQuery);
    if (!$stmt) {
        throw new Exception('DB prepare failed (list): ' . $conn->error);
    }

    $listParams = $params;
    $listTypes = $types;
    $listParams[] = $limit;
    $listParams[] = $offset;
    $listTypes .= 'ii';
    $stmt->bind_param($listTypes, ...$listParams);
    $stmt->execute();
    $result = $stmt->get_result();

    $quotes = [];
    while ($row = $result->fetch_assoc()) {
        $quotes[] = [
            'id' => (int)($row['id'] ?? 0),
            'quote_number' => $row['quote_number'],
            'customer_name' => $row['customer_name'],
            'customer_email' => $row['customer_email'],
            'file_path' => $row['file_path'],
            'created_at' => $row['created_at'],
            'status' => $row['status'] ?? 'pending',
            'expiry_date' => $row['expiry_date'] ?? null,
            'items' => [
                ['name' => '', 'quantity' => (int)($row['item_count'] ?? 0), 'price' => 0],
            ],
            'subtotal' => (float)($row['subtotal'] ?? 0),
            'tax' => (float)($row['tax'] ?? 0),
            'total' => (float)($row['total'] ?? 0),
        ];
    }
    $stmt->close();

    sendSuccess([
        'data' => $quotes,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalCount,
            'pages' => (int)ceil($totalCount / $limit),
        ],
    ]);
} catch (Throwable $e) {
    error_log('getQuote error: ' . $e->getMessage());
    sendError(500, 'Failed to fetch quotes');
}


