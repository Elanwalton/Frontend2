<?php
/**
 * test-notification-logic.php
 * Verifies that notification settings are respected.
 */

require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/NotificationService.php';
// require_once __DIR__ . '/admin/updateSettings.php'; // Removed to avoid immediate execution

echo "=== Notification Logic Verification ===\n";

$conn = getDbConnection();

// 1. Setup: Get valid admin user ID
$adminId = 0;
$stmt = $conn->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    $adminId = $row['id'];
    echo "[INFO] Found admin ID: $adminId\n";
} else {
    die("[Error] No admin user found.\n");
}

function setSetting($conn, $key, $value) {
    echo "[Setup] Setting '$key' to '$value'...\n";
    $valStr = $value ? 'true' : 'false';
    $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value, category) VALUES (?, ?, 'notifications') ON DUPLICATE KEY UPDATE setting_value = ?");
    $stmt->bind_param('sss', $key, $valStr, $valStr);
    $stmt->execute();
}

function countNotifications($conn, $userId, $title) {
    $stmt = $conn->prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND title = ?");
    $stmt->bind_param('is', $userId, $title);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    return (int)$row['c'];
}

// 2. Test: Disable Review Notifications
echo "\n--- Test Case 1: Disabled Notifications ---\n";
setSetting($conn, 'review_notifications', false);

$title1 = "Test Review " . time();
echo "[Action] Broadcasting review notification: '$title1'\n";
$countParams = NotificationService::broadcastToAdmins($conn, 'review', $title1, 'Should NOT appear');

if ($countParams === 0) {
    echo "[PASS] NotificationService returned 0 (no notifications sent).\n";
} else {
    echo "[FAIL] NotificationService returned $countParams (expected 0).\n";
}

$dbCount = countNotifications($conn, $adminId, $title1);
if ($dbCount === 0) {
    echo "[PASS] Database confirmed 0 notifications found.\n";
} else {
    echo "[FAIL] Database found $dbCount notifications (expected 0).\n";
}

// 3. Test: Enable Review Notifications
echo "\n--- Test Case 2: Enabled Notifications ---\n";
setSetting($conn, 'review_notifications', true);

$title2 = "Test Review Enabled " . time();
echo "[Action] Broadcasting review notification: '$title2'\n";
$countParams = NotificationService::broadcastToAdmins($conn, 'review', $title2, 'Should APPEAR');

if ($countParams > 0) {
    echo "[PASS] NotificationService returned $countParams (notifications sent).\n";
} else {
    echo "[FAIL] NotificationService returned 0 (expected > 0).\n";
}

$dbCount = countNotifications($conn, $adminId, $title2);
if ($dbCount > 0) {
    echo "[PASS] Database confirmed $dbCount notifications found.\n";
} else {
    echo "[FAIL] Database found 0 notifications (expected > 0).\n";
}

echo "\n=== Verification Complete ===\n";
