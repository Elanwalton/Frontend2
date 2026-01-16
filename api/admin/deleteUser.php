<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

header('Content-Type: application/json; charset=utf-8');

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if (($auth['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '[]', true);
if (!is_array($body)) $body = [];

$id = isset($body['id']) ? (int)$body['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing id']);
    exit;
}

try {
    // Soft delete implementation (no deleted_at/is_deleted column exists):
    // mark account as suspended and anonymize email/phone to avoid re-login.
    // If you later add deleted_at, we can switch to that.

    $conn->begin_transaction();

    // Fetch user for audit/anonymization
    $stmtSel = $conn->prepare('SELECT email FROM users WHERE id = ? LIMIT 1');
    if (!$stmtSel) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmtSel->bind_param('i', $id);
    $stmtSel->execute();
    $res = $stmtSel->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmtSel->close();

    if (!$row) {
        $conn->rollback();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    $anonEmail = 'deleted_' . $id . '_' . time() . '@example.invalid';

    $stmt = $conn->prepare("UPDATE users SET status = 'suspended', is_verified = 0, email = ?, phone = NULL WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('si', $anonEmail, $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'User soft-deleted',
        'updated' => $affected,
    ]);
} catch (Throwable $e) {
    // Rollback if we started a transaction
    if ($conn && $conn->errno === 0) {
        @$conn->rollback();
    }
    error_log('deleteUser error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error',
        'details' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
