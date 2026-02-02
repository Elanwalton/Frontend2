<?php
require_once __DIR__ . '/ApiHelper.php';
require 'session-config.php';

$conn = getDbConnection();
$token = getAuthToken();
$userData = validateToken($conn, $token);
$userId = $userData['user_id'];

// Table creation removed to prevent runtime errors.
// Please ensure the 'user_addresses' table exists in your database.

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all addresses for user
        $sql = "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $addresses = [];
        while ($row = $result->fetch_assoc()) {
            $addresses[] = $row;
        }
        
        echo json_encode(['success' => true, 'addresses' => $addresses]);
        break;
        
    case 'POST':
        // Add new address
        $input = json_decode(file_get_contents('php://input'), true);
        
        $requiredFields = ['label', 'address_line1', 'city', 'country'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "$field is required"]);
                exit;
            }
        }
        
        $label = trim($input['label']);
        $addressLine1 = trim($input['address_line1']);
        $addressLine2 = trim($input['address_line2'] ?? '');
        $city = trim($input['city']);
        $state = trim($input['state'] ?? '');
        $postalCode = trim($input['postal_code'] ?? '');
        $country = trim($input['country']);
        $phone = trim($input['phone'] ?? '');
        $isDefault = $input['is_default'] ?? false;
        
        // If setting as default, unset other defaults
        if ($isDefault) {
            $unsetDefaultSql = "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?";
            $stmt = $conn->prepare($unsetDefaultSql);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
        }
        
        $sql = "INSERT INTO user_addresses (user_id, label, address_line1, address_line2, city, state, postal_code, country, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issssssssi", $userId, $label, $addressLine1, $addressLine2, $city, $state, $postalCode, $country, $phone, $isDefault);
        
        if ($stmt->execute()) {
            $addressId = $conn->insert_id;
            echo json_encode(['success' => true, 'message' => 'Address added successfully', 'address_id' => $addressId]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add address']);
        }
        break;
        
    case 'PUT':
        // Update address
        $input = json_decode(file_get_contents('php://input'), true);
        $addressId = $input['id'] ?? 0;
        
        if (!$addressId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Address ID is required']);
            exit;
        }
        
        // Check if address belongs to user
        $checkSql = "SELECT id FROM user_addresses WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param("ii", $addressId, $userId);
        $stmt->execute();
        $checkResult = $stmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Address not found']);
            exit;
        }
        
        $isDefault = $input['is_default'] ?? false;
        
        // If setting as default, unset other defaults
        if ($isDefault) {
            $unsetDefaultSql = "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?";
            $stmt = $conn->prepare($unsetDefaultSql);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
        }
        
        $sql = "UPDATE user_addresses SET label = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, phone = ?, is_default = ? WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssssssiii", $input['label'], $input['address_line1'], $input['address_line2'], $input['city'], $input['state'], $input['postal_code'], $input['country'], $input['phone'], $isDefault, $addressId, $userId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Address updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update address']);
        }
        break;
        
    case 'DELETE':
        // Delete address
        $addressId = $_GET['id'] ?? 0;
        
        if (!$addressId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Address ID is required']);
            exit;
        }
        
        $sql = "DELETE FROM user_addresses WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $addressId, $userId);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(['success' => true, 'message' => 'Address deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Address not found']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete address']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

$conn->close();
?>
