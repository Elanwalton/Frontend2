<?php
/**
 * updateProfile.php
 * Update user profile information
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

try {
    $conn->begin_transaction();
    $userId = (int)$userData['user_id'];
    
    // Update user table
    if (isset($input['first_name']) || isset($input['last_name']) || isset($input['phone'])) {
        $updateFields = [];
        $params = [];
        $types = '';
        
        if (isset($input['first_name'])) {
            $updateFields[] = "first_name = ?";
            $params[] = $input['first_name'];
            $types .= 's';
        }
        
        if (isset($input['last_name'])) {
            $updateFields[] = "second_name = ?";
            $params[] = $input['last_name'];
            $types .= 's';
        }
        
        if (isset($input['phone'])) {
            $updateFields[] = "phone = ?";
            $params[] = $input['phone'];
            $types .= 's';
        }
        
        if (!empty($updateFields)) {
            $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $params[] = $userId;
            $types .= 'i';
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
        }
    }
    
    // Check if profile exists
    $checkStmt = $conn->prepare("SELECT user_id FROM user_profiles WHERE user_id = ?");
    $checkStmt->bind_param('i', $userId);
    $checkStmt->execute();
    $profileExists = $checkStmt->get_result()->num_rows > 0;
    
    // Prepare profile data
    $profileFields = [
        'bio', 'company', 'address_line1', 'address_line2', 
        'city', 'state', 'postal_code', 'country', 'timezone', 'language'
    ];
    
    $profileData = [];
    foreach ($profileFields as $field) {
        if (isset($input[$field])) {
            $profileData[$field] = $input[$field];
        }
    }
    
    // Handle notification preferences
    if (isset($input['notification_preferences'])) {
        $profileData['notification_preferences'] = json_encode($input['notification_preferences']);
    }
    
    if (!empty($profileData)) {
        if ($profileExists) {
            // Update existing profile
            $updateFields = [];
            $params = [];
            $types = '';
            
            foreach ($profileData as $key => $value) {
                $updateFields[] = "{$key} = ?";
                $params[] = $value;
                $types .= 's';
            }
            
            $query = "UPDATE user_profiles SET " . implode(', ', $updateFields) . " WHERE user_id = ?";
            $params[] = $userId;
            $types .= 'i';
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            
        } else {
            // Insert new profile
            $fields = array_keys($profileData);
            $fields[] = 'user_id';
            $profileData['user_id'] = $userId;
            
            $placeholders = array_fill(0, count($fields), '?');
            $query = "INSERT INTO user_profiles (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            
            $types = str_repeat('s', count($fields) - 1) . 'i';
            $params = array_values($profileData);
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
        }
    }
    
    // Update password if provided
    if (!empty($input['current_password']) && !empty($input['new_password'])) {
        // Verify current password
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!password_verify($input['current_password'], $user['password'])) {
            throw new Exception('Current password is incorrect');
        }
        
        // Update password
        $newPasswordHash = password_hash($input['new_password'], PASSWORD_BCRYPT);
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param('si', $newPasswordHash, $userId);
        $stmt->execute();
    }
    
    // Log activity
    $logStmt = $conn->prepare("
        INSERT INTO admin_activity_log 
        (user_id, action, entity_type, entity_id, description, ip_address) 
        VALUES (?, 'profile_update', 'user', ?, 'Updated profile', ?)
    ");
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $logStmt->bind_param('iis', $userId, $userId, $ipAddress);
    $logStmt->execute();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully'
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update profile',
        'message' => $e->getMessage()
    ]);
}
