<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';
require_once __DIR__ . '/../analyticsConfig.php';

use Google\Analytics\Data\V1beta\Client\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\RunReportRequest;

$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    if (!file_exists(CREDENTIALS_PATH)) {
        throw new Exception('GA4 credentials not configured');
    }

    $client = new BetaAnalyticsDataClient([
        'credentials' => CREDENTIALS_PATH
    ]);

    // Get daily metrics from GA4
    $request = new RunReportRequest([
        'property' => GA4_PROPERTY_ID,
        'date_ranges' => [
            new DateRange([
                'start_date' => '30daysAgo',
                'end_date' => 'today',
            ]),
        ],
        'dimensions' => [
            new Dimension(['name' => 'date']),
        ],
        'metrics' => [
            new Metric(['name' => 'screenPageViews']),
            new Metric(['name' => 'totalUsers']),
        ],
    ]);
    
    $response = $client->runReport($request);

    $dailyData = [];

    foreach ($response->getRows() as $row) {
        $date = $row->getDimensionValues()[0]->getValue();
        $pageViews = $row->getMetricValues()[0]->getValue();
        $visitors = $row->getMetricValues()[1]->getValue();

        // Format date from YYYYMMDD to YYYY-MM-DD
        $formattedDate = substr($date, 0, 4) . '-' . substr($date, 4, 2) . '-' . substr($date, 6, 2);
        
        $dailyData[] = [
            'date' => $formattedDate,
            'pageViews' => (int)$pageViews,
            'visitors' => (int)$visitors
        ];
    }

    // Sort by date
    usort($dailyData, function($a, $b) {
        return strcmp($a['date'], $b['date']);
    });

    echo json_encode([
        'success' => true,
        'data' => $dailyData
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Unable to fetch daily metrics'
    ]);
}
?>