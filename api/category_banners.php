<?php
header("Content-Type: application/json");

// Load ApiHelper for proper CORS handling
require_once 'ApiHelper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$category = $_GET['category'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'active') {
                // Get active banners for frontend
                getActiveBanners($conn, $category);
            } elseif ($action === 'categories') {
                // Get all unique categories
                getCategories($conn);
            } else {
                // Get all banners for admin
                getAllBanners($conn, $category);
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

function getActiveBanners($conn, $category) {
    if ($category) {
        $sql = "SELECT * FROM category_banners WHERE status = 'active' AND category_name = ? ORDER BY display_order ASC LIMIT 3";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $sql = "SELECT * FROM category_banners WHERE status = 'active' ORDER BY category_name, display_order ASC";
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

function getCategories($conn) {
    $sql = "SELECT DISTINCT category_name FROM category_banners WHERE status = 'active' ORDER BY category_name ASC";
    $result = $conn->query($sql);
    
    $categories = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row['category_name'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $categories
    ]);
}

function getAllBanners($conn, $category) {
    if ($category) {
        $sql = "SELECT * FROM category_banners WHERE category_name = ? ORDER BY display_order ASC, created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $sql = "SELECT * FROM category_banners ORDER BY category_name, display_order ASC, created_at DESC";
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

function createBanner($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $category_name = $data['category_name'] ?? '';
    $image_url = $data['image_url'] ?? '';
    $link_url = $data['link_url'] ?? '';
    $status = $data['status'] ?? 'active';
    $display_order = intval($data['display_order'] ?? 0);
    
    if (empty($image_url) || empty($category_name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Image URL and category name are required']);
        return;
    }
    
    $sql = "INSERT INTO category_banners (category_name, image_url, link_url, status, display_order) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssi', $category_name, $image_url, $link_url, $status, $display_order);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Category banner created successfully',
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
    $category_name = $data['category_name'] ?? '';
    $image_url = $data['image_url'] ?? '';
    $link_url = $data['link_url'] ?? '';
    $status = $data['status'] ?? 'active';
    $display_order = intval($data['display_order'] ?? 0);
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid banner ID']);
        return;
    }
    
    $sql = "UPDATE category_banners SET category_name = ?, image_url = ?, link_url = ?, status = ?, display_order = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssssii', $category_name, $image_url, $link_url, $status, $display_order, $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Category banner updated successfully'
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
    
    $sql = "DELETE FROM category_banners WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Category banner deleted successfully'
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
    $uploadDir = __DIR__ . '/../images/category_banners/';
    
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
    
    $filename = 'category_' . time() . '_' . uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Set proper permissions
        chmod($targetPath, 0644);
        
        echo json_encode([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'image_url' => 'images/category_banners/' . $filename
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
