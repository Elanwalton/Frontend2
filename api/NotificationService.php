<?php

declare(strict_types=1);

/**
 * Minimal notification helper for the PHP API.
 * Insert notifications for a single user or broadcast to all admins.
 */
final class NotificationService
{
    /**
     * Check if a specific notification setting is enabled.
     * Defaults to true if setting not found to ensure critical alerts aren't missed by accident.
     */
    public static function checkSetting(mysqli $conn, string $settingKey): bool
    {
        // Map notification types to setting keys
        $map = [
            'order' => 'order_notifications',
            'inventory' => 'low_stock_alerts',
            'review' => 'review_notifications',
            'user' => 'email_notifications', // General fallback or specific
            'system' => null, // System notifications might always be forced
        ];

        // If the key passed is a raw type (e.g. 'order'), map it. 
        // If it's a direct setting key (e.g. 'order_notifications'), use it.
        $actualKey = $map[$settingKey] ?? $settingKey;

        if ($actualKey === null) {
            return true; // Always allow if no mapping (e.g. system messages)
        }

        $stmt = $conn->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?");
        if (!$stmt) {
            return true; // Fail safe
        }
        
        $stmt->bind_param('s', $actualKey);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($row = $res->fetch_assoc()) {
            // 'true' string or 1
            $val = strtolower((string)$row['setting_value']);
            return $val === 'true' || $val === '1';
        }

        return true; // Default to true if setting doesn't exist
    }

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
     * Checks site_settings before sending.
     */
    public static function broadcastToAdmins(mysqli $conn, string $type, string $title, ?string $message = null, ?string $link = null): int
    {
        // Check if this notification type is enabled
        if (!self::checkSetting($conn, $type)) {
            return 0; // Notification suppressed by settings
        }

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
