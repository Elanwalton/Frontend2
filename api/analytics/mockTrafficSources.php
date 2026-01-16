<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Mock realistic traffic sources data
$mockData = [
    [
        'source' => 'google',
        'sessions' => 12450,
        'users' => 8900,
        'percentage' => 42
    ],
    [
        'source' => 'direct',
        'sessions' => 7280,
        'users' => 5200,
        'percentage' => 24
    ],
    [
        'source' => 'facebook',
        'sessions' => 5340,
        'users' => 3800,
        'percentage' => 18
    ],
    [
        'source' => 'linkedin',
        'sessions' => 3680,
        'users' => 2600,
        'percentage' => 12
    ],
    [
        'source' => 'referral',
        'sessions' => 1190,
        'users' => 850,
        'percentage' => 4
    ]
];

echo json_encode([
    'success' => true,
    'data' => $mockData,
    'totalSessions' => 29940,
    'timestamp' => time(),
    'mock' => true
]);
?>
