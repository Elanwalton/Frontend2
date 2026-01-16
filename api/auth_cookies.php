<?php
// api/auth_cookies.php
// Central cookie helpers for auth tokens

declare(strict_types=1);

require_once __DIR__ . '/auth_tokens.php';

function cookieParams(): array {
    $isProd = ($_ENV['NODE_ENV'] ?? 'development') === 'production';

    return [
        'secure'   => $isProd,
        'httpOnly' => true,
        'sameSite' => $_ENV['COOKIE_SAMESITE'] ?? 'Lax', // 'Strict', 'Lax', or 'None'
        'domain'   => $_ENV['COOKIE_DOMAIN'] ?? '',      // e.g. '.example.com'
        'path'     => '/',
    ];
}

function setAccessCookieEnhanced(string $token): void {
    $p = cookieParams();
    setcookie('access_token', $token, [
        'expires'  => time() + ACCESS_TTL,
        'path'     => $p['path'],
        'domain'   => $p['domain'],
        'secure'   => $p['secure'],
        'httponly' => $p['httpOnly'],
        'samesite' => $p['sameSite'],
    ]);
}

function setRefreshCookie(string $token): void {
    $p = cookieParams();
    setcookie('refresh_token', $token, [
        'expires'  => time() + REFRESH_TTL,
        'path'     => $p['path'],
        'domain'   => $p['domain'],
        'secure'   => $p['secure'],
        'httponly' => $p['httpOnly'],
        'samesite' => $p['sameSite'],
    ]);
}

function clearAuthCookies(): void {
    $p = cookieParams();
    foreach (['access_token', 'refresh_token'] as $name) {
        setcookie($name, '', [
            'expires'  => time() - 3600,
            'path'     => $p['path'],
            'domain'   => $p['domain'],
            'secure'   => $p['secure'],
            'httponly' => $p['httpOnly'],
            'samesite' => $p['sameSite'],
        ]);
    }
}
