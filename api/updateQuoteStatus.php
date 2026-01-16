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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

$input = getJsonInput();
$quoteNumber = (string)($input['quote_number'] ?? '');
$status = (string)($input['status'] ?? '');

if ($quoteNumber === '' || $status === '') {
    sendError(400, 'quote_number and status are required');
}

$allowed = ['pending', 'sent', 'accepted', 'rejected', 'expired'];
if (!in_array($status, $allowed, true)) {
    sendError(400, 'Invalid status');
}

try {
    $stmt = $conn->prepare('UPDATE quotations SET status = ? WHERE quote_number = ? LIMIT 1');
    if (!$stmt) {
        throw new Exception('DB prepare failed: ' . $conn->error);
    }

    $stmt->bind_param('ss', $status, $quoteNumber);
    if (!$stmt->execute()) {
        throw new Exception('DB execute failed: ' . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        $stmt->close();
        sendError(404, 'Quote not found');
    }

    $stmt->close();
    sendSuccess(['message' => 'Status updated']);
} catch (Throwable $e) {
    error_log('updateQuoteStatus error: ' . $e->getMessage());
    sendError(500, 'Failed to update status');
}
