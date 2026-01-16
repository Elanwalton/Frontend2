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
$role = isset($body['role']) ? (string)$body['role'] : '';
$uiStatus = isset($body['status']) ? (string)$body['status'] : '';

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing id']);
    exit;
}

$allowedRoles = ['admin', 'staff', 'customer', 'client', 'user'];
if ($role !== '' && !in_array($role, $allowedRoles, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit;
}

// Normalize incoming role values. UI uses customer; DB can keep legacy client.
if ($role === 'customer') {
    $role = 'client';
} elseif ($role === 'user') {
    $role = 'client';
}

$allowedUiStatuses = ['Active', 'Unverified', 'Suspended'];
if ($uiStatus !== '' && !in_array($uiStatus, $allowedUiStatuses, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

try {
    // Prevent admin from modifying their own account status/role accidentally? (allow role edits if desired)
    // We'll allow it for now.

    $fields = [];
    $types = '';
    $params = [];

    if ($role !== '') {
        $fields[] = 'role = ?';
        $types .= 's';
        $params[] = $role;
    }

    // Map UI status to DB fields.
    // Your DB currently has: users.status (varchar) and users.is_verified (tinyint/bool)
    if ($uiStatus !== '') {
        if ($uiStatus === 'Suspended') {
            $fields[] = 'status = ?';
            $types .= 's';
            $params[] = 'suspended';
        } else {
            // Active / Unverified should be non-suspended in DB
            $fields[] = 'status = ?';
            $types .= 's';
            $params[] = 'active';
        }

        if ($uiStatus === 'Active') {
            $fields[] = 'is_verified = 1';
        } elseif ($uiStatus === 'Unverified') {
            $fields[] = 'is_verified = 0';
        }
    }

    if (empty($fields)) {
        echo json_encode(['success' => true, 'message' => 'Nothing to update']);
        exit;
    }

    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $types .= 'i';
    $params[] = $id;

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'User updated',
        'updated' => $stmt->affected_rows,
    ]);
} catch (Throwable $e) {
    error_log('updateUser error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
} finally {
    $conn->close();
}
