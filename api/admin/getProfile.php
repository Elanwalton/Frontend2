<?php
/**
 * getProfile.php
 * Get current user's profile information
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
// This endpoint is in admin/, restrict to admins
$userData = $auth;

try {
    $userId = (int)$userData['user_id'];
    
    // Get user and profile data
    $query = "
        SELECT 
            u.id,
            u.first_name,
            u.second_name,
            u.email,
            u.phone,
            u.role,
            u.status,
            u.created_at,
            p.avatar_url,
            p.bio,
            p.company,
            p.address_line1,
            p.address_line2,
            p.city,
            p.state,
            p.postal_code,
            p.country,
            p.timezone,
            p.language,
            p.notification_preferences
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.id = ?
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $notificationPrefs = $row['notification_preferences'] 
            ? json_decode($row['notification_preferences'], true) 
            : [
                'email_notifications' => true,
                'order_notifications' => true,
                'review_notifications' => true,
                'low_stock_alerts' => true
            ];
        
        $profile = [
            'id' => (int)$row['id'],
            'first_name' => $row['first_name'],
            'last_name' => $row['second_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'role' => $row['role'],
            'status' => $row['status'],
            'avatar_url' => $row['avatar_url'],
            'bio' => $row['bio'],
            'company' => $row['company'],
            'address' => [
                'line1' => $row['address_line1'],
                'line2' => $row['address_line2'],
                'city' => $row['city'],
                'state' => $row['state'],
                'postal_code' => $row['postal_code'],
                'country' => $row['country']
            ],
            'timezone' => $row['timezone'] ?? 'America/New_York',
            'language' => $row['language'] ?? 'en',
            'notification_preferences' => $notificationPrefs,
            'member_since' => $row['created_at']
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $profile
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch profile',
        'message' => $e->getMessage()
    ]);
}
