<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$position = $_GET['position'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'active') {
                // Get active banners for frontend
                getActiveBanners($conn, $position);
            } else {
                // Get all banners for admin
                getAllBanners($conn);
            }
            break;
            
        case 'POST':
            if ($action === 'create') {
                createBanner($conn);
            } elseif ($action === 'upload') {
                uploadImage();
            }
            break;
            
        case 'PUT':
            updateBanner($conn);
            break;
            
        case 'DELETE':
            deleteBanner($conn);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function getActiveBanners($conn, $position) {
    if ($position) {
        // Get banners for specific position
        $sql = "SELECT * FROM hero_slides WHERE status = 'active' AND position = ? ORDER BY display_order ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $position);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        // Get all active banners
        $sql = "SELECT * FROM hero_slides WHERE status = 'active' ORDER BY position, display_order ASC";
        $result = $conn->query($sql);
    }
    
    $banners = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $banners[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $banners
    ]);
}

function getAllBanners($conn) {
    $sql = "SELECT * FROM hero_slides ORDER BY position, display_order ASC, created_at DESC";
    $result = $conn->query($sql);
    
    $banners = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $banners[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $banners
    ]);
}

function createBanner($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $image_url = $data['image_url'] ?? '';
    $title = $data['title'] ?? '';
    $subtitle = $data['subtitle'] ?? '';
    $link_url = $data['link_url'] ?? '';
    $status = $data['status'] ?? 'active';
    $display_order = intval($data['display_order'] ?? 0);
    $position = $data['position'] ?? 'main';
    
    if (empty($image_url) || empty($title)) {
        http_response_code(400);
        echo json_encode(['error' => 'Image URL and title are required']);
        return;
    }
    
    $sql = "INSERT INTO hero_slides (image_url, title, subtitle, link_url, status, display_order, position) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssis', $image_url, $title, $subtitle, $link_url, $status, $display_order, $position);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Banner created successfully',
            'id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create banner: ' . $stmt->error]);
    }
}

function updateBanner($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = intval($data['id'] ?? 0);
    $image_url = $data['image_url'] ?? '';
    $title = $data['title'] ?? '';
    $subtitle = $data['subtitle'] ?? '';
    $link_url = $data['link_url'] ?? '';
    $status = $data['status'] ?? 'active';
    $display_order = intval($data['display_order'] ?? 0);
    $position = $data['position'] ?? 'main';
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid banner ID']);
        return;
    }
    
    $sql = "UPDATE hero_slides SET image_url = ?, title = ?, subtitle = ?, link_url = ?, status = ?, display_order = ?, position = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssisi', $image_url, $title, $subtitle, $link_url, $status, $display_order, $position, $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Banner updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update banner: ' . $stmt->error]);
    }
}

function deleteBanner($conn) {
    $id = intval($_GET['id'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid banner ID']);
        return;
    }
    
    $sql = "DELETE FROM hero_slides WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Banner deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete banner: ' . $stmt->error]);
    }
}

function uploadImage() {
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No image file provided']);
        return;
    }
    
    $file = $_FILES['image'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Upload error: ' . $file['error']]);
        return;
    }
    
    // Use relative path from API directory
    $uploadDir = __DIR__ . '/../images/hero/';
    
    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create upload directory: ' . $uploadDir]);
            return;
        }
    }
    
    // Check if directory is writable
    if (!is_writable($uploadDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Upload directory is not writable: ' . $uploadDir]);
        return;
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes) && !in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed. Detected: ' . $mimeType]);
        return;
    }
    
    // Validate file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'File size exceeds 5MB limit']);
        return;
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (empty($extension)) {
        // Fallback to mime type extension
        $mimeToExt = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif'
        ];
        $extension = $mimeToExt[$mimeType] ?? 'jpg';
    }
    
    $filename = 'hero_' . time() . '_' . uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Set proper permissions
        chmod($targetPath, 0644);
        
        echo json_encode([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'image_url' => 'images/hero/' . $filename
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to move uploaded file',
            'tmp_name' => $file['tmp_name'],
            'target' => $targetPath,
            'upload_dir_exists' => file_exists($uploadDir),
            'upload_dir_writable' => is_writable($uploadDir)
        ]);
    }
}

$conn->close();
?>
