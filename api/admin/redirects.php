<?php
// api/admin/redirects.php - CRUD API for Redirect Manager
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $conn = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
        case 'POST':
            handlePost($conn);
            break;
        case 'DELETE':
            handleDelete($conn);
            break;
        default:
            sendError('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log('Redirect API Error: ' . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage());
}

function handleGet($conn) {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM url_redirects WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if ($result) {
            sendSuccess($result);
        } else {
            sendError('Redirect not found', 404);
        }
        return;
    }

    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, min(100, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $search = $_GET['search'] ?? null;

    $where = "";
    $params = [];
    $types = "";

    if ($search) {
        $where = " WHERE old_url LIKE ? OR new_url LIKE ? OR notes LIKE ?";
        $searchTerm = "%$search%";
        $params = [$searchTerm, $searchTerm, $searchTerm];
        $types = "sss";
    }

    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM url_redirects" . $where;
    $countStmt = $conn->prepare($countSql);
    if ($search) $countStmt->bind_param($types, ...$params);
    $countStmt->execute();
    $total = $countStmt->get_result()->fetch_assoc()['total'];

    // Get items
    $sql = "SELECT * FROM url_redirects" . $where . " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    sendSuccess([
        'items' => $items,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ]
    ]);
}

function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $oldUrl = $data['old_url'] ?? '';
    $newUrl = $data['new_url'] ?? '';
    $type = $data['redirect_type'] ?? '301';
    $status = $data['status'] ?? 'active';
    $notes = $data['notes'] ?? '';

    if (empty($oldUrl) || empty($newUrl)) {
        sendError('Old URL and New URL are required', 400);
    }

    // Ensure old_url starts with /
    if (strpos($oldUrl, '/') !== 0) {
        $oldUrl = '/' . $oldUrl;
    }

    if ($id) {
        // Update
        $stmt = $conn->prepare("UPDATE url_redirects SET old_url = ?, new_url = ?, redirect_type = ?, status = ?, notes = ?, updated_at = NOW() WHERE id = ?");
        $stmt->bind_param('sssssi', $oldUrl, $newUrl, $type, $status, $notes, $id);
        if ($stmt->execute()) {
            sendSuccess(['message' => 'Redirect updated successfully']);
        } else {
            sendError('Failed to update redirect');
        }
    } else {
        // Create
        $stmt = $conn->prepare("INSERT INTO url_redirects (old_url, new_url, redirect_type, status, notes, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param('sssss', $oldUrl, $newUrl, $type, $status, $notes);
        if ($stmt->execute()) {
            sendSuccess(['message' => 'Redirect created successfully', 'id' => $conn->insert_id]);
        } else {
            sendError('Failed to create redirect');
        }
    }
}

function handleDelete($conn) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
    }

    if (!$id) {
        sendError('ID is required', 400);
    }

    $stmt = $conn->prepare("DELETE FROM url_redirects WHERE id = ?");
    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        sendSuccess(['message' => 'Redirect deleted successfully']);
    } else {
        sendError('Failed to delete redirect');
    }
}
?>
