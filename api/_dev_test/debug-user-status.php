<?php
// api/debug-user-status.php
require_once __DIR__ . '/ApiHelper.php';

header('Content-Type: application/json');

try {
    $conn = getDbConnection();
    
    // Check users with admin-like emails
    $stmt = $conn->prepare('SELECT id, email, first_name, role, is_verified, created_at FROM users WHERE email LIKE "%elan%" OR email LIKE "%walton%" OR role = "admin" ORDER BY id DESC LIMIT 10');
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => $row['id'],
            'email' => $row['email'],
            'first_name' => $row['first_name'],
            'role' => $row['role'],
            'is_verified' => (bool)$row['is_verified'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'count' => count($users)
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
