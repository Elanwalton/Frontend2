<?php
require 'connection.php';

$keepEmail = 'elanwalton@gmail.com';

try {
    $conn->begin_transaction();

    // 1. Get the ID of the user to keep
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $keepEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $keepUser = $result->fetch_assoc();
    $stmt->close();

    if (!$keepUser) {
        throw new Exception("Target user '$keepEmail' not found in database. Aborting cleanup for safety.");
    }

    $keepId = $keepUser['id'];
    echo "Keeping user ID: $keepId ($keepEmail)\n";

    // 2. Tables referencing user_id
    $dependentTables = [
        'admin_activity_log',
        'notifications',
        'orders',
        'password_reset_tokens',
        'payments',
        'quote_requests',
        'refresh_tokens',
        'returns',
        'reviews',
        'session_tokens',
        'user_profiles',
        'verification_tokens'
    ];

    foreach ($dependentTables as $table) {
        $deleteSql = "DELETE FROM `$table` WHERE user_id != ?";
        $delStmt = $conn->prepare($deleteSql);
        $delStmt->bind_param("i", $keepId);
        $delStmt->execute();
        $affected = $conn->affected_rows;
        echo "Deleted $affected rows from `$table`.\n";
        $delStmt->close();
    }

    // 3. Finally delete other users
    $userDelSql = "DELETE FROM users WHERE id != ?";
    $userDelStmt = $conn->prepare($userDelSql);
    $userDelStmt->bind_param("i", $keepId);
    $userDelStmt->execute();
    $usersAffected = $conn->affected_rows;
    echo "Deleted $usersAffected other users.\n";
    $userDelStmt->close();

    $conn->commit();
    echo "\nSUCCESS: Cleanup complete. Only $keepEmail remains.\n";

} catch (Exception $e) {
    if ($conn) $conn->rollback();
    echo "\nERROR: " . $e->getMessage() . "\n";
}

$conn->close();
?>
