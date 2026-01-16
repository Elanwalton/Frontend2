<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Generate realistic daily metrics for the last 30 days
$mockData = [];
$baseVisitors = 2000;
$basePageViews = 6000;

for ($i = 29; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    
    // Add some randomness to make it realistic
    $visitorVariation = rand(-500, 800);
    $pageViewVariation = rand(-1000, 2000);
    
    $visitors = max(1000, $baseVisitors + $visitorVariation + ($i * 50));
    $pageViews = max(3000, $visitors * 3 + $pageViewVariation);
    
    $mockData[] = [
        'date' => $date,
        'pageViews' => $pageViews,
        'visitors' => $visitors
    ];
}

echo json_encode([
    'success' => true,
    'data' => $mockData,
    'mock' => true,
    'generated' => date('Y-m-d H:i:s')
]);
?>
