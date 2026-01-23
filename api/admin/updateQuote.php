<?php
/**
 * Update Quote
 * Admin endpoint to edit quote details before sending
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

try {
    $input = getJsonInput();
    $quoteNumber = (string)($input['quote_number'] ?? '');
    $customerName = (string)($input['customer_name'] ?? '');
    $customerEmail = (string)($input['customer_email'] ?? '');
    $items = $input['items'] ?? [];

    if ($quoteNumber === '' || $customerName === '' || $customerEmail === '') {
        sendError(400, 'Quote number, customer name, and email are required');
    }

    if (!is_array($items) || empty($items)) {
        sendError(400, 'Items array is required and cannot be empty');
    }

    // Validate email
    if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        sendError(400, 'Invalid email address');
    }

    // Start transaction
    $conn->begin_transaction();

    // Update quotation record
    $adminId = (int)($auth['id'] ?? 0);
    $reviewedAt = date('Y-m-d H:i:s');

    $stmt = $conn->prepare("UPDATE quotations SET customer_name = ?, customer_email = ?, reviewed_by = ?, reviewed_at = ? WHERE quote_number = ?");
    if (!$stmt) {
        throw new Exception('Failed to prepare quotation update');
    }

    $stmt->bind_param('ssiss', $customerName, $customerEmail, $adminId, $reviewedAt, $quoteNumber);
    if (!$stmt->execute()) {
        throw new Exception('Failed to update quotation');
    }
    $stmt->close();

    // Delete existing quote items
    $deleteStmt = $conn->prepare("DELETE FROM quote_items WHERE quote_id = ?");
    if (!$deleteStmt) {
        throw new Exception('Failed to prepare delete statement');
    }
    $deleteStmt->bind_param('s', $quoteNumber);
    $deleteStmt->execute();
    $deleteStmt->close();

    // Insert updated items
    $itemStmt = $conn->prepare("INSERT INTO quote_items (quote_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)");
    if (!$itemStmt) {
        throw new Exception('Failed to prepare item insert');
    }

    $subtotal = 0.0;
    foreach ($items as $item) {
        $productId = (int)($item['product_id'] ?? 0);
        $quantity = (int)($item['quantity'] ?? 0);
        $unitPrice = (float)($item['price'] ?? 0);

        if ($quantity < 1 || $unitPrice < 0) {
            throw new Exception('Invalid item quantity or price');
        }

        $totalPrice = $quantity * $unitPrice;
        $subtotal += $totalPrice;

        $itemStmt->bind_param('siidd', $quoteNumber, $productId, $quantity, $unitPrice, $totalPrice);
        if (!$itemStmt->execute()) {
            throw new Exception('Failed to insert quote item');
        }
    }
    $itemStmt->close();

    // Recalculate totals
    $vatRate = 0.0; // VAT set to 0% as per requirements
    $taxAmount = ($subtotal * $vatRate) / 100.0;
    $total = $subtotal + $taxAmount;

    // Regenerate PDF
    require_once __DIR__ . '/../solar/quoteHelpers.php';
    $pdfPath = generateQuotePDF($quoteNumber, $customerName, $customerEmail, $items, $subtotal, $vatRate, $taxAmount, $total);

    if ($pdfPath) {
        $updatePdfStmt = $conn->prepare("UPDATE quotations SET file_path = ? WHERE quote_number = ?");
        if ($updatePdfStmt) {
            $updatePdfStmt->bind_param('ss', $pdfPath, $quoteNumber);
            $updatePdfStmt->execute();
            $updatePdfStmt->close();
        }
    }

    $conn->commit();

    sendSuccess([
        'data' => [
            'quote_number' => $quoteNumber,
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'subtotal' => round($subtotal, 2),
            'vat_amount' => round($taxAmount, 2),
            'total' => round($total, 2),
            'file_path' => $pdfPath,
            'reviewed_by' => $adminId,
            'reviewed_at' => $reviewedAt,
            'message' => 'Quote updated successfully'
        ]
    ]);

} catch (Throwable $e) {
    if ($conn && $conn->errno === 0) {
        // no-op
    }
    try {
        $conn->rollback();
    } catch (Throwable $ignored) {
        // ignore rollback errors
    }
    error_log('updateQuote error: ' . $e->getMessage());
    sendError(500, 'Failed to update quote');
}
