<?php
/**
 * Get Admin Settings
 * Fetch admin settings including AI toggle
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(405, 'Method not allowed');
}

try {
    // Fetch all settings
    $stmt = $conn->prepare("SELECT setting_key, setting_value, description, updated_at FROM admin_settings");
    if (!$stmt) {
        throw new Exception('Failed to prepare settings query');
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $settings = [];
    while ($row = $result->fetch_assoc()) {
        $settings[$row['setting_key']] = [
            'value' => $row['setting_value'],
            'description' => $row['description'],
            'updated_at' => $row['updated_at'],
        ];
    }
    $stmt->close();

    // Ensure AI setting exists with default
    if (!isset($settings['ai_quote_generation_enabled'])) {
        $settings['ai_quote_generation_enabled'] = [
            'value' => 'true',
            'description' => 'Enable or disable AI-powered quote generation from client requests',
            'updated_at' => null,
        ];
    }

    sendSuccess([
        'data' => $settings
    ]);

} catch (Throwable $e) {
    error_log('getSettings error: ' . $e->getMessage());
    sendError(500, 'Failed to fetch settings');
}
