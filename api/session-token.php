<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

// Get action parameter
$action = $_GET['action'] ?? '';

// Debug: Log the action for troubleshooting
error_log("Session token API called with action: " . $action);

// Create or validate session token
function createSessionToken($userId, $email, $role) {
    $token = bin2hex(random_bytes(32));
    $expires = time() + 86400; // 24 hours
    
    // Store token in database
    global $conn;
    $sql = "INSERT INTO session_tokens (token, user_id, email, role, expires_at) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sisss", $token, $userId, $email, $role, $expires);
    $stmt->execute();
    
    return $token;
}

function validateSessionToken($token) {
    global $conn;
    $currentTime = time();
    
    // Log for debugging
    error_log("Validating token: " . substr($token, 0, 8) . "... at time: " . $currentTime);
    
    $sql = "SELECT * FROM session_tokens WHERE token = ? AND expires_at > ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $token, $currentTime);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $session = $result->fetch_assoc();
        
        // Get full user details from users table
        $userSql = "SELECT id, email, first_name, second_name, phone, role, is_verified FROM users WHERE id = ?";
        $stmt = $conn->prepare($userSql);
        $stmt->bind_param("i", $session['user_id']);
        $stmt->execute();
        $userResult = $stmt->get_result();
        
        if ($userResult->num_rows > 0) {
            $user = $userResult->fetch_assoc();
            return [
                'token' => $session['token'],
                'user_id' => $session['user_id'],
                'email' => $session['email'],
                'role' => $session['role'],
                'user' => $user
            ];
        }
    }
    return null;
}

function deleteSessionToken($token) {
    global $conn;
    $sql = "DELETE FROM session_tokens WHERE token = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $token);
    $stmt->execute();
}

// Handle different actions
switch ($action) {
    case 'create':
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['user_id'] ?? 0;
        $email = $input['email'] ?? '';
        $role = $input['role'] ?? '';
        
        if ($userId && $email) {
            $token = createSessionToken($userId, $email, $role);
            echo json_encode(['success' => true, 'token' => $token]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
        }
        break;
        
    case 'validate':
        $token = $_GET['token'] ?? '';
        if ($token) {
            $session = validateSessionToken($token);
            if ($session) {
                echo json_encode([
                    'success' => true,
                    'user' => $session['user']
                ]);
            } else {
                // Check if token exists but expired
                $checkExpiredSql = "SELECT expires_at FROM session_tokens WHERE token = ?";
                $stmt = $conn->prepare($checkExpiredSql);
                $stmt->bind_param("s", $token);
                $stmt->execute();
                $expiredResult = $stmt->get_result();
                
                if ($expiredResult->num_rows > 0) {
                    $expired = $expiredResult->fetch_assoc();
                    $expiresAt = $expired['expires_at'];
                    $currentTime = time();
                    
                    if ($expiresAt <= $currentTime) {
                        echo json_encode([
                            'success' => false, 
                            'message' => 'Token expired',
                            'expired_at' => $expiresAt,
                            'current_time' => $currentTime
                        ]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Invalid token']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Token not found']);
                }
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No token provided']);
        }
        break;
        
    case 'delete':
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
        if ($token) {
            deleteSessionToken($token);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

?>
