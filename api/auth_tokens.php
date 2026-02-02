<?php
// api/auth_tokens.php
// JWT access token helpers

declare(strict_types=1);

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/vendor/autoload.php';

const ACCESS_TTL  = 3600;          // 1 hour (increased from 15 min)
const REFRESH_TTL = 60 * 60 * 24 * 30; // 30 days

function getJwtSecret(): string {
    return $_ENV['JWT_ACCESS_SECRET'] ?? 'change_me_in_env';
}

/**
 * Generate signed access token (JWT)
 */
function generateAccessToken(array $user): string {
    $now = time();

    $payload = [
        'sub'   => (int)($user['id'] ?? 0),
        'email' => $user['email'] ?? null,
        'role'  => $user['role'] ?? 'client',
        'iat'   => $now,
        'exp'   => $now + ACCESS_TTL,
        'iss'   => $_ENV['TOKEN_ISSUER'] ?? 'sunleaf-api',
    ];

    return JWT::encode($payload, getJwtSecret(), 'HS256');
}

/**
 * Validate token signature & expiry.
 * Returns decoded payload array or throws an Exception.
 */
function validateAccessToken(string $jwt): array {
    $decoded = JWT::decode($jwt, new Key(getJwtSecret(), 'HS256'));
    return json_decode(json_encode($decoded), true);
}

