<?php
// Production-ready configuration for inventory API
require_once __DIR__ . '/../ApiHelper.php';

// Production settings
$isProduction = ($_ENV['APP_DEBUG'] ?? 'false') === 'false';

// Get database connection
$conn = getDbConnection();

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Rate limiting (simple implementation)
function rateLimit($requests = 100, $window = 3600) {
    $key = 'rate_limit_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $current = $_SESSION[$key] ?? ['count' => 0, 'start' => time()];
    
    if (time() - $current['start'] > $window) {
        $current = ['count' => 1, 'start' => time()];
    } else {
        $current['count']++;
    }
    
    $_SESSION[$key] = $current;
    
    if ($current['count'] > $requests) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests']);
        exit;
    }
}

// Authentication check
function requireAuth() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
    
    // Check if user has admin role for inventory operations
    if ($_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Insufficient permissions']);
        exit;
    }
}

// Input validation
function validateInput($data, $rules) {
    $errors = [];
    
    foreach ($rules as $field => $rule) {
        $value = $data[$field] ?? null;
        
        if (isset($rule['required']) && $rule['required'] && ($value === null || $value === '')) {
            $errors[$field] = "Field $field is required";
            continue;
        }
        
        if ($value !== null && $value !== '') {
            if (isset($rule['type']) && !filter_var($value, $rule['type'])) {
                $errors[$field] = "Invalid $field format";
            }
            
            if (isset($rule['min']) && strlen($value) < $rule['min']) {
                $errors[$field] = "Field $field must be at least {$rule['min']} characters";
            }
            
            if (isset($rule['max']) && strlen($value) > $rule['max']) {
                $errors[$field] = "Field $field must not exceed {$rule['max']} characters";
            }
        }
    }
    
    return $errors;
}

// Error logging
function logError($message, $context = []) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'context' => $context,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_id' => $_SESSION['user_id'] ?? null
    ];
    
    $logFile = __DIR__ . '/../logs/inventory_errors.log';
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

// Standardized error response
function sendError($message, $code = 500, $details = null) {
    global $isProduction;
    
    http_response_code($code);
    
    $response = [
        'error' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if (!$isProduction && $details) {
        $response['details'] = $details;
    }
    
    echo json_encode($response);
    exit;
}

// Standardized success response
function sendSuccess($data, $message = 'Success') {
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

// API versioning
define('API_VERSION', 'v1');
define('API_BASE', "/api/" . API_VERSION . "/inventory");

// Timezone
date_default_timezone_set('Africa/Nairobi');
?>
