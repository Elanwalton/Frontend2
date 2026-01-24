<?php
declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Content Type
|--------------------------------------------------------------------------
*/
header('Content-Type: application/json; charset=utf-8');

/*
|--------------------------------------------------------------------------
| Production Error Handling
|--------------------------------------------------------------------------
*/
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
ini_set('error_log', $logDir . '/api-errors.log');

/*
|--------------------------------------------------------------------------
| Load Environment Variables (REQUIRED)
|--------------------------------------------------------------------------
*/
$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration error'
    ]);
    exit;
}

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

/*
|--------------------------------------------------------------------------
| CORS Configuration (FIXED + PRODUCTION SAFE)
|--------------------------------------------------------------------------
*/
$spaOrigin = $_ENV['SPA_ORIGIN'] ?? '';
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($requestOrigin && $requestOrigin === $spaOrigin) {
    header("Access-Control-Allow-Origin: {$requestOrigin}");
} else {
    // Always send a valid header to prevent browser hard failure
    header("Access-Control-Allow-Origin: {$spaOrigin}");
}

header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
header('Vary: Origin');

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'CLI';

if ($requestMethod === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Database Connection (NO FALLBACKS)
|--------------------------------------------------------------------------
*/
function getDbConnection(): mysqli
{
    $required = ['DB_HOST', 'DB_USER', 'DB_NAME', "DB_PASS"];

    foreach ($required as $key) {
        if ($key === 'DB_PASS') {
            // DB_PASS can be empty for localhost/root access
            if (!isset($_ENV[$key])) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database configuration error'
                ]);
                exit;
            }
        } else {
            // Other fields must not be empty
            if (empty($_ENV[$key])) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database configuration error'
                ]);
                exit;
            }
        }
    }

    $conn = mysqli_connect(
        $_ENV['DB_HOST'],
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        $_ENV['DB_NAME']
    );

    if (!$conn) {
        error_log('DB connection failed: ' . mysqli_connect_error());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Service unavailable'
        ]);
        exit;
    }

    mysqli_set_charset($conn, 'utf8mb4');
    return $conn;
}

/*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/
function sendSuccess(array $data = [], int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['success' => true] + $data);
    exit;
}

function sendError(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit;
}
/**
 * Get the Frontend URL robustly
 */
function getFrontendUrl(): string
{
    $url = $_ENV['NEXT_PUBLIC_BASE_URL'] ?? $_ENV['SPA_ORIGIN'] ?? null;
    
    if (!$url) {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        // Production fallback for Sunleaf
        if (strpos($host, 'api.sunleaftechnologies.co.ke') !== false || 
            strpos($host, 'sunleaftechnologies.co.ke') !== false) {
            return 'https://sunleaftechnologies.co.ke';
        }
        return 'http://localhost:3000';
    }
    
    return rtrim($url, '/');
}

/*
|--------------------------------------------------------------------------
| JSON Input
|--------------------------------------------------------------------------
*/
function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError(400, 'Invalid JSON payload');
    }

    return $data ?? [];
}

/*
|--------------------------------------------------------------------------
| Authorization Token
|--------------------------------------------------------------------------
*/
function getAuthToken(): string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }

    if ($header) {
        return trim($header);
    }

    // Fallback: Check for access_token cookie
    return $_COOKIE['access_token'] ?? '';
}

/*
|--------------------------------------------------------------------------
| User Authentication
|--------------------------------------------------------------------------
*/
function validateToken(mysqli $conn, string $token): array
{
    if (!$token) {
        sendError(401, 'Unauthorized');
    }

    $now = time();

    $stmt = $conn->prepare(
        'SELECT user_id, role 
         FROM session_tokens 
         WHERE token = ? AND expires_at > ? 
         LIMIT 1'
    );

    if (!$stmt) {
        error_log('Auth query prepare failed: ' . $conn->error);
        sendError(500, 'Authentication failure');
    }

    $stmt->bind_param('si', $token, $now);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$user) {
        sendError(401, 'Unauthorized');
    }

    return [
        'user_id' => (int) $user['user_id'],
        'role'    => $user['role']
    ];
}

/*
|--------------------------------------------------------------------------
| Admin Authentication
|--------------------------------------------------------------------------
*/
function validateAdminToken(mysqli $conn, string $token): array
{
    if (!$token) {
        sendError(401, 'Unauthorized');
    }

    $now = time();

    $stmt = $conn->prepare(
        'SELECT user_id, role 
         FROM session_tokens 
         WHERE token = ? AND expires_at > ? 
         LIMIT 1'
    );

    if (!$stmt) {
        error_log('Auth query prepare failed');
        sendError(500, 'Authentication failure');
    }

    $stmt->bind_param('si', $token, $now);
    $stmt->execute();
    $result = $stmt->get_result();
    $user   = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$user) {
        sendError(401, 'Unauthorized');
    }

    if ($user['role'] !== 'admin') {
        sendError(403, 'Forbidden');
    }

    return [
        'user_id' => (int) $user['user_id'],
        'role'    => $user['role']
    ];
}
