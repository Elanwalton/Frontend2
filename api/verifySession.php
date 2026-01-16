<?php
/**
 * verifySession.php – Verifies session from SPA
 */
require_once __DIR__ . '/ApiHelper.php';

// Allow sessionId override from JSON body
$rawInput = file_get_contents("php://input");
$body = json_decode($rawInput, true);

if (!empty($body['sessionId'])) {
    session_id($body['sessionId']);
}

// Start session with same config as Login.php
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => 86400,
        'cookie_path'     => '/',
        'cookie_secure'   => false,
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
    ]);
}

// ---------------------------
//  Default response
// ---------------------------
$response = [
    'authenticated' => false,
    'user'          => null,
    'message'       => 'Not authenticated',
];

// ---------------------------
//  DB connection
// ---------------------------
require_once __DIR__ . '/connection.php'; // provides $conn
if (!$conn) {
    http_response_code(500);
    echo json_encode([
        'authenticated' => false,
        'user' => null,
        'message' => 'Database connection error',
    ]);
    exit;
}

// ---------------------------
//  Auth check
// ---------------------------
if (!empty($_SESSION['user_id'])) {
    try {
        $stmt = $conn->prepare('SELECT id, email, first_name, role FROM users WHERE id = ? LIMIT 1');
        $stmt->bind_param('i', $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            $response = [
                'authenticated' => true,
                'user' => [
                    'id'        => (int) $user['id'],
                    'email'     => $user['email'],
                    'firstName' => $user['first_name'],
                    'role'      => $user['role'],
                ],
                'message' => 'Authenticated',
            ];
        } else {
            http_response_code(401);
            $response['message'] = 'User not found';
        }
        $stmt->close();
    } catch (Throwable $e) {
        http_response_code(500);
        $response['message'] = 'Server error: ' . $e->getMessage();
    }
}

// ---------------------------
//  Return JSON
// ---------------------------
header('Content-Type: application/json');
echo json_encode($response);
exit;
