<?php
/**
 * updateSettings.php
 * Update site settings
 */

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$settings = $input['settings'] ?? [];

if (empty($settings)) {
    http_response_code(400);
    echo json_encode(['error' => 'No settings provided']);
    exit;
}

try {
    $conn->begin_transaction();
    
    $stmt = $conn->prepare("
        UPDATE site_settings 
        SET setting_value = ?, updated_by = ? 
        WHERE setting_key = ?
    ");
    
    $userId = (int)$userData['user_id'];
    $updatedCount = 0;
    
    foreach ($settings as $key => $value) {
        // Convert value to string for storage
        if (is_bool($value)) {
            $value = $value ? 'true' : 'false';
        } elseif (is_array($value)) {
            $value = json_encode($value);
        } else {
            $value = (string)$value;
        }
        
        $stmt->bind_param('sis', $value, $userId, $key);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            $updatedCount++;
        }
    }
    
    // Log activity
    $logStmt = $conn->prepare("
        INSERT INTO admin_activity_log 
        (user_id, action, entity_type, description, ip_address) 
        VALUES (?, 'settings_update', 'settings', ?, ?)
    ");
    $description = "Updated {$updatedCount} settings";
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $logStmt->bind_param('iss', $userId, $description, $ipAddress);
    $logStmt->execute();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "{$updatedCount} settings updated successfully"
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update settings',
        'message' => $e->getMessage()
    ]);
}
