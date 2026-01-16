<?php

declare(strict_types=1);

function rateLimitOrFail(string $namespace, int $minSecondsBetweenRequests = 5): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = sys_get_temp_dir() . '/' . $namespace . '_' . md5($ip);

    if (file_exists($rateLimitFile)) {
        $lastRequest = (int)file_get_contents($rateLimitFile);
        if (time() - $lastRequest < $minSecondsBetweenRequests) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'message' => 'Please wait a few seconds before trying again'
            ]);
            exit;
        }
    }

    file_put_contents($rateLimitFile, (string)time());
}
