<?php
// api/refresh_tokens.php
// Refresh token storage & rotation

declare(strict_types=1);

require_once __DIR__ . '/auth_tokens.php';
require_once __DIR__ . '/auth_cookies.php';
require_once __DIR__ . '/ApiHelper.php';

/**
 * Create and persist a new refresh token; set cookie.
 */
function issueRefreshToken(mysqli $conn, int $userId): void {
    $raw = bin2hex(random_bytes(32));
    $hash = hash('sha256', $raw);
    $now  = time();
    $exp  = date('Y-m-d H:i:s', $now + REFRESH_TTL);
    $ua   = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $ip   = $_SERVER['REMOTE_ADDR'] ?? null;

    $stmt = $conn->prepare("INSERT INTO refresh_tokens (token_hash, user_id, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        sendError(500, 'Failed to prepare refresh token statement');
    }
    $stmt->bind_param('sisss', $hash, $userId, $ua, $ip, $exp);
    $stmt->execute();
    $stmt->close();

    setRefreshCookie($raw);
}

/**
 * Rotation: invalidate old refresh, create new one, set new cookie.
 */
function rotateRefreshToken(mysqli $conn, string $oldRaw, int $userId): void {
    $oldHash = hash('sha256', $oldRaw);
    $newRaw  = bin2hex(random_bytes(32));
    $newHash = hash('sha256', $newRaw);
    $now     = time();
    $exp     = date('Y-m-d H:i:s', $now + REFRESH_TTL);

    $conn->begin_transaction();

    $revokedAt = date('Y-m-d H:i:s', $now);
    $stmt = $conn->prepare("UPDATE refresh_tokens SET revoked = 1, revoked_at = ?, replaced_by = ? WHERE token_hash = ? AND user_id = ? AND revoked = 0");
    if (!$stmt) {
        $conn->rollback();
        sendError(500, 'Failed to prepare revoke statement');
    }
    $stmt->bind_param('sssi', $revokedAt, $newHash, $oldHash, $userId);
    $stmt->execute();
    $stmt->close();

    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $stmt = $conn->prepare("INSERT INTO refresh_tokens (token_hash, user_id, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        $conn->rollback();
        sendError(500, 'Failed to prepare new refresh token');
    }
    $stmt->bind_param('sisss', $newHash, $userId, $ua, $ip, $exp);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    setRefreshCookie($newRaw);
}

/**
 * Revoke a refresh token by raw value (used for logout or suspected compromise).
 */
function revokeRefreshToken(mysqli $conn, string $raw): void {
    $hash = hash('sha256', $raw);
    $now  = date('Y-m-d H:i:s');

    $stmt = $conn->prepare("UPDATE refresh_tokens SET revoked = 1, revoked_at = ? WHERE token_hash = ?");
    if ($stmt) {
        $stmt->bind_param('ss', $now, $hash);
        $stmt->execute();
        $stmt->close();
    }
}
