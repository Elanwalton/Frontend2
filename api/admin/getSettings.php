<?php
/**
 * getSettings.php
 * Get site settings by category
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

$category = $_GET['category'] ?? 'all';

try {
    $query = "SELECT setting_key, setting_value, setting_type, category, description FROM site_settings";
    
    if ($category !== 'all') {
        $query .= " WHERE category = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($query);
    }
    
    $settings = [];
    while ($row = $result->fetch_assoc()) {
        $value = $row['setting_value'];
        
        // Convert value based on type
        switch ($row['setting_type']) {
            case 'number':
                $value = is_numeric($value) ? (float)$value : 0;
                break;
            case 'boolean':
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                break;
            case 'json':
                $value = json_decode($value, true);
                break;
        }
        
        $settings[$row['setting_key']] = [
            'value' => $value,
            'type' => $row['setting_type'],
            'category' => $row['category'],
            'description' => $row['description']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $settings
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch settings',
        'message' => $e->getMessage()
    ]);
}
