<?php
/**
 * Update Admin Settings
 * Update admin settings including AI toggle and other system settings
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
    $settings = $input['settings'] ?? [];

    if (empty($settings) || !is_array($settings)) {
        sendError(400, 'Settings object is required');
    }

    $userId = (int)($auth['id'] ?? 0);
    $updated = [];

    // Prepare statement for bulk insert/update
    $stmt = $conn->prepare("
        INSERT INTO admin_settings (setting_key, setting_value, updated_by) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            updated_by = VALUES(updated_by),
            updated_at = CURRENT_TIMESTAMP
    ");

    if (!$stmt) {
        throw new Exception('Failed to prepare update statement');
    }

    // Process each setting
    foreach ($settings as $key => $value) {
        // Convert boolean to string
        if (is_bool($value)) {
            $value = $value ? 'true' : 'false';
        }
        
        $settingValue = (string)$value;
        
        $stmt->bind_param('ssi', $key, $settingValue, $userId);
        
        if ($stmt->execute()) {
            $updated[] = $key;
        } else {
            error_log("Failed to update setting: $key");
        }
    }

    $stmt->close();

    sendSuccess([
        'data' => [
            'updated_count' => count($updated),
            'updated_settings' => $updated,
            'message' => 'Settings updated successfully'
        ]
    ]);

} catch (Throwable $e) {
    error_log('updateSettings error: ' . $e->getMessage());
    sendError(500, 'Failed to update settings');
}
