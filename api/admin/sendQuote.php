<?php
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

$input = getJsonInput();
$quoteNumber = (string)($input['quote_number'] ?? '');
$channel = (string)($input['channel'] ?? ''); // 'email' | 'whatsapp'

if ($quoteNumber === '' || $channel === '') {
    sendError(400, 'quote_number and channel are required');
}

$allowedChannels = ['email', 'whatsapp'];
if (!in_array($channel, $allowedChannels, true)) {
    sendError(400, 'Invalid channel');
}

try {
    $qStmt = $conn->prepare('SELECT quote_number, customer_name, customer_email, file_path FROM quotations WHERE quote_number = ? LIMIT 1');
    if (!$qStmt) {
        throw new Exception('Failed to prepare quote query');
    }
    $qStmt->bind_param('s', $quoteNumber);
    $qStmt->execute();
    $qRes = $qStmt->get_result();
    $quote = $qRes ? $qRes->fetch_assoc() : null;
    $qStmt->close();

    if (!$quote) {
        sendError(404, 'Quote not found');
    }

    $email = (string)($quote['customer_email'] ?? '');

    // Attempt to pull phone number from users table by email, if available
    $phone = '';
    if ($email !== '') {
        if ($uStmt = $conn->prepare('SELECT phone FROM users WHERE email = ? LIMIT 1')) {
            $uStmt->bind_param('s', $email);
            $uStmt->execute();
            $uRes = $uStmt->get_result();
            $u = $uRes ? $uRes->fetch_assoc() : null;
            $uStmt->close();
            $phone = (string)($u['phone'] ?? '');
        }
    }

    // If requesting email send but no email exists
    if ($channel === 'email' && $email === '') {
        sendError(400, 'Customer email not available for this quote');
    }

    // If requesting WhatsApp send but no phone exists
    if ($channel === 'whatsapp' && $phone === '') {
        sendError(400, 'Customer phone not available for this quote');
    }

    // Mark as accepted immediately since "sent/shared successfully" defines acceptance in this project
    if ($sStmt = $conn->prepare('UPDATE quotations SET status = ? WHERE quote_number = ? LIMIT 1')) {
        $accepted = 'accepted';
        $sStmt->bind_param('ss', $accepted, $quoteNumber);
        $sStmt->execute();
        $sStmt->close();
    }

    sendSuccess([
        'data' => [
            'quote_number' => (string)$quote['quote_number'],
            'customer_name' => (string)($quote['customer_name'] ?? ''),
            'customer_email' => $email,
            'customer_phone' => $phone,
            'file_path' => (string)($quote['file_path'] ?? ''),
        ]
    ]);
} catch (Throwable $e) {
    error_log('sendQuote error: ' . $e->getMessage());
    sendError(500, 'Failed to prepare send');
}
