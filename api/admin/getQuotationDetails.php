<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$quoteNumber = (string)($_GET['quote_number'] ?? '');
if ($quoteNumber === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing quote_number']);
    exit;
}

try {
    // Quote header
    $qStmt = $conn->prepare('SELECT quote_number, customer_name, customer_email, file_path, created_at, expiry_date, status FROM quotations WHERE quote_number = ? LIMIT 1');
    if (!$qStmt) {
        throw new Exception('Failed to prepare quotation query');
    }
    $qStmt->bind_param('s', $quoteNumber);
    $qStmt->execute();
    $qRes = $qStmt->get_result();
    $quote = $qRes ? $qRes->fetch_assoc() : null;
    $qStmt->close();

    if (!$quote) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Quote not found']);
        exit;
    }

    // Items (quote_items.quote_id stores quote_number in the solar flow)
    $itemsStmt = $conn->prepare('
        SELECT 
            qi.product_id,
            COALESCE(p.name, CONCAT("Product #", qi.product_id)) AS name,
            COALESCE(p.description, "") AS description,
            qi.quantity,
            qi.unit_price
        FROM quote_items qi
        LEFT JOIN products p ON p.id = qi.product_id
        WHERE qi.quote_id = ?
        ORDER BY qi.id ASC
    ');
    if (!$itemsStmt) {
        throw new Exception('Failed to prepare quote items query');
    }
    $itemsStmt->bind_param('s', $quoteNumber);
    $itemsStmt->execute();
    $itemsRes = $itemsStmt->get_result();

    $items = [];
    $subtotal = 0.0;

    if ($itemsRes) {
        while ($row = $itemsRes->fetch_assoc()) {
            $qty = (int)$row['quantity'];
            $unit = (float)$row['unit_price'];
            $line = $qty * $unit;
            $subtotal += $line;

            $items[] = [
                'product_id' => (int)$row['product_id'],
                'name' => (string)$row['name'],
                'description' => (string)$row['description'],
                'quantity' => $qty,
                'price' => $unit,
            ];
        }
    }

    $itemsStmt->close();

    $vatRate = 16.0;
    $vatAmount = round(($subtotal * $vatRate) / 100, 2);
    $total = round($subtotal + $vatAmount, 2);

    echo json_encode([
        'success' => true,
        'data' => [
            'quote_id' => 0,
            'quote_number' => (string)$quote['quote_number'],
            'customer_name' => (string)($quote['customer_name'] ?? ''),
            'customer_email' => (string)($quote['customer_email'] ?? ''),
            'items' => $items,
            'subtotal' => round($subtotal, 2),
            'vat_rate' => $vatRate,
            'vat_amount' => $vatAmount,
            'total' => $total,
            'file_path' => (string)($quote['file_path'] ?? ''),
            'created_at' => (string)($quote['created_at'] ?? ''),
            'expiry_date' => (string)($quote['expiry_date'] ?? ''),
            'status' => (string)($quote['status'] ?? 'pending'),
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch quotation details',
        'message' => $e->getMessage(),
    ]);
}
