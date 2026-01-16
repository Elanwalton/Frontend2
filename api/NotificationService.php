<?php

declare(strict_types=1);

/**
 * Minimal notification helper for the PHP API.
 * Insert notifications for a single user or broadcast to all admins.
 */
final class NotificationService
{
    /**
     * Create a notification for a single user.
     */
    public static function create(mysqli $conn, int $userId, string $type, string $title, ?string $message = null, ?string $link = null): int
    {
        $stmt = $conn->prepare(
            'INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES (?, ?, ?, ?, ?, 0)'
        );

        if (!$stmt) {
            throw new Exception('DB prepare failed (notifications.create): ' . $conn->error);
        }

        $stmt->bind_param('issss', $userId, $type, $title, $message, $link);
        $stmt->execute();
        $id = (int)$stmt->insert_id;
        $stmt->close();

        return $id;
    }

    /**
     * Broadcast a notification to all admin users.
     */
    public static function broadcastToAdmins(mysqli $conn, string $type, string $title, ?string $message = null, ?string $link = null): int
    {
        $adminIds = [];

        $stmt = $conn->prepare("SELECT id FROM users WHERE role = 'admin'");
        if (!$stmt) {
            throw new Exception('DB prepare failed (notifications.admin_ids): ' . $conn->error);
        }
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $adminIds[] = (int)$row['id'];
        }
        $stmt->close();

        if (count($adminIds) === 0) {
            return 0;
        }

        $insert = $conn->prepare(
            'INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES (?, ?, ?, ?, ?, 0)'
        );
        if (!$insert) {
            throw new Exception('DB prepare failed (notifications.broadcast): ' . $conn->error);
        }

        $count = 0;
        foreach ($adminIds as $adminId) {
            $insert->bind_param('issss', $adminId, $type, $title, $message, $link);
            $insert->execute();
            $count++;
        }
        $insert->close();

        return $count;
    }
}
