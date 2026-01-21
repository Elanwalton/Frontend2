<?php
/**
 * upload-profile-picture.php
 * Profile picture upload endpoint
 */

require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth_tokens.php';

$conn = getDbConnection();

// Get and validate JWT access token
$accessToken = $_COOKIE['access_token'] ?? '';

if ($accessToken === '') {
    sendError(401, 'Unauthorized');
}

try {
    $payload = validateAccessToken($accessToken);
    $userId = (int)($payload['sub'] ?? 0);
    
    if ($userId <= 0) {
        sendError(401, 'Invalid access token');
    }
} catch (Throwable $e) {
    error_log('Token validation error in upload-profile-picture.php: ' . $e->getMessage());
    sendError(401, 'Unauthorized');
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

// Check if file was uploaded
if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = 'No file uploaded';
    if (isset($_FILES['profile_picture']['error'])) {
        switch ($_FILES['profile_picture']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMsg = 'File is too large (max 5MB)';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMsg = 'No file was uploaded';
                break;
            default:
                $errorMsg = 'File upload failed';
        }
    }
    sendError(400, $errorMsg);
}

$file = $_FILES['profile_picture'];

// Validate file size (5MB max)
$maxSize = 5 * 1024 * 1024; // 5MB in bytes
if ($file['size'] > $maxSize) {
    sendError(400, 'File is too large. Maximum size is 5MB');
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    sendError(400, 'Invalid file type. Only JPG, PNG, and WebP images are allowed');
}

// Get file extension
$extension = '';
switch ($mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
        $extension = 'jpg';
        break;
    case 'image/png':
        $extension = 'png';
        break;
    case 'image/webp':
        $extension = 'webp';
        break;
}

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . '/../images/profiles/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        sendError(500, 'Failed to create upload directory');
    }
}

// Generate unique filename
$filename = 'user_' . $userId . '_' . time() . '.' . $extension;
$uploadPath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    sendError(500, 'Failed to save uploaded file');
}

// Delete old profile picture if it exists
try {
    $stmt = $conn->prepare("SELECT profile_picture FROM users WHERE id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user && !empty($user['profile_picture'])) {
        $oldFile = __DIR__ . '/../images/' . $user['profile_picture'];
        if (file_exists($oldFile) && is_file($oldFile)) {
            @unlink($oldFile);
        }
    }
} catch (Exception $e) {
    // Log but don't fail if we can't delete old file
    error_log('Failed to delete old profile picture: ' . $e->getMessage());
}

// Update database with new profile picture path
$profilePicturePath = 'profiles/' . $filename;

try {
    $stmt = $conn->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
    $stmt->bind_param('si', $profilePicturePath, $userId);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        // Rollback: delete uploaded file
        @unlink($uploadPath);
        sendError(500, 'Failed to update profile picture in database');
    }
    
    sendSuccess([
        'message' => 'Profile picture updated successfully',
        'profile_picture' => $profilePicturePath,
        'url' => '/images/' . $profilePicturePath
    ]);
    
} catch (Exception $e) {
    // Rollback: delete uploaded file
    @unlink($uploadPath);
    error_log('Profile picture update error: ' . $e->getMessage());
    sendError(500, 'Failed to update profile picture');
}

$conn->close();
