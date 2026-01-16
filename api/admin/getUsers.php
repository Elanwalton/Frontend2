<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Restrict to admins
if (($auth['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

// Get all users
$usersSql = "SELECT id, email, first_name, second_name, phone, role, status, is_verified, created_at, last_login FROM users ORDER BY created_at DESC";
$usersResult = $conn->query($usersSql);

if (!$usersResult) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch users']);
    exit;
}

$users = [];
while ($row = $usersResult->fetch_assoc()) {
    $role = (string)($row['role'] ?? 'customer');
    $roleNorm = strtolower($role);
    if ($roleNorm === 'client' || $roleNorm === 'user') {
        $role = 'customer';
    }

    $accountStatus = strtolower((string)($row['status'] ?? 'active'));
    $isSuspended = $accountStatus === 'suspended';
    $isVerified = ((int)($row['is_verified'] ?? 0)) === 1;

    if ($isSuspended) {
        $uiStatus = 'Suspended';
    } elseif ($isVerified) {
        $uiStatus = 'Active';
    } else {
        $uiStatus = 'Unverified';
    }

    $users[] = [
        'id' => (int)$row['id'],
        'email' => $row['email'],
        'name' => trim($row['first_name'] . ' ' . $row['second_name']),
        'first_name' => $row['first_name'],
        'second_name' => $row['second_name'],
        'phone' => $row['phone'],
        'role' => $role,
        'status_db' => $row['status'],
        'is_verified' => (bool)$row['is_verified'],
        'created_at' => $row['created_at'],
        'last_login' => $row['last_login'],
        'joined' => $row['created_at'],
        'status' => $uiStatus
    ];
}

echo json_encode([
    'success' => true,
    'users' => $users,
    'count' => count($users)
]);

?>
