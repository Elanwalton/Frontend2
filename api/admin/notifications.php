<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

header('Content-Type: application/json');

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $auth['id'];

function timeAgo(string $datetime): string
{
    $timestamp = strtotime($datetime);
    if ($timestamp === false) return '';

    $diff = time() - $timestamp;
    if ($diff < 60) return 'just now';
    if ($diff < 3600) return floor($diff / 60) . ' minutes ago';
    if ($diff < 86400) return floor($diff / 3600) . ' hours ago';
    return floor($diff / 86400) . ' days ago';
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
        $offset = ($page - 1) * $limit;

        // Unread count
        $stmtUnread = $conn->prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0');
        if (!$stmtUnread) {
            throw new Exception('DB prepare failed (unread_count): ' . $conn->error);
        }
        $stmtUnread->bind_param('i', $userId);
        $stmtUnread->execute();
        $unreadRow = $stmtUnread->get_result()->fetch_assoc();
        $unreadCount = (int)($unreadRow['c'] ?? 0);
        $stmtUnread->close();

        // Total count
        $stmtTotal = $conn->prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ?');
        if (!$stmtTotal) {
            throw new Exception('DB prepare failed (total): ' . $conn->error);
        }
        $stmtTotal->bind_param('i', $userId);
        $stmtTotal->execute();
        $totalRow = $stmtTotal->get_result()->fetch_assoc();
        $total = (int)($totalRow['c'] ?? 0);
        $stmtTotal->close();

        // List
        $stmt = $conn->prepare(
            'SELECT id, type, title, message, link, is_read, created_at, read_at '
            . 'FROM notifications '
            . 'WHERE user_id = ? '
            . 'ORDER BY created_at DESC '
            . 'LIMIT ? OFFSET ?'
        );
        if (!$stmt) {
            throw new Exception('DB prepare failed (list): ' . $conn->error);
        }
        $stmt->bind_param('iii', $userId, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();

        $notifications = [];
        while ($row = $result->fetch_assoc()) {
            $createdAt = (string)($row['created_at'] ?? '');
            $notifications[] = [
                'id' => (int)$row['id'],
                'type' => (string)$row['type'],
                'title' => (string)$row['title'],
                'message' => $row['message'] !== null ? (string)$row['message'] : '',
                'link' => $row['link'] !== null ? (string)$row['link'] : '',
                'read' => ((int)$row['is_read']) === 1,
                'timeAgo' => $createdAt ? timeAgo($createdAt) : '',
                'created_at' => $createdAt,
                'read_at' => $row['read_at'],
            ];
        }
        $stmt->close();

        echo json_encode([
            'success' => true,
            'notifications' => $notifications,
            'count' => count($notifications),
            'unread_count' => $unreadCount,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => $limit ? (int)ceil($total / $limit) : 1,
            ]
        ]);
        exit;
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw ?: '[]', true);
        if (!is_array($body)) $body = [];

        $action = $body['action'] ?? '';

        // Mark a single notification as read
        if ($action === 'mark_read') {
            $id = isset($body['id']) ? (int)$body['id'] : 0;
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing id']);
                exit;
            }

            $stmt = $conn->prepare('UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
            if (!$stmt) {
                throw new Exception('DB prepare failed (mark_read): ' . $conn->error);
            }
            $stmt->bind_param('ii', $id, $userId);
            $stmt->execute();
            $affected = $stmt->affected_rows;
            $stmt->close();

            echo json_encode(['success' => true, 'updated' => $affected]);
            exit;
        }

        // Mark all as read
        if ($action === 'mark_all_read') {
            $stmt = $conn->prepare('UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0');
            if (!$stmt) {
                throw new Exception('DB prepare failed (mark_all_read): ' . $conn->error);
            }
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $affected = $stmt->affected_rows;
            $stmt->close();

            echo json_encode(['success' => true, 'updated' => $affected]);
            exit;
        }

        // Create notification (admin-only convenience)
        if ($action === 'create') {
            if (($auth['role'] ?? '') !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Admin access required']);
                exit;
            }

            $targetUserId = isset($body['user_id']) ? (int)$body['user_id'] : 0;
            $type = isset($body['type']) ? (string)$body['type'] : 'system';
            $title = isset($body['title']) ? trim((string)$body['title']) : '';
            $message = isset($body['message']) ? (string)$body['message'] : null;
            $link = isset($body['link']) ? (string)$body['link'] : null;

            if ($targetUserId <= 0 || $title === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing user_id or title']);
                exit;
            }

            $stmt = $conn->prepare('INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES (?, ?, ?, ?, ?, 0)');
            if (!$stmt) {
                throw new Exception('DB prepare failed (create): ' . $conn->error);
            }
            $stmt->bind_param('issss', $targetUserId, $type, $title, $message, $link);
            $stmt->execute();
            $newId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'id' => (int)$newId]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
} catch (Throwable $e) {
    error_log('notifications api error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
