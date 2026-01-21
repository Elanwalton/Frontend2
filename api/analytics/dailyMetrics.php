<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';
require_once __DIR__ . '/../analyticsConfig.php';

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
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

    // Dependencies exist, proceed with real check
    if (!file_exists(CREDENTIALS_PATH)) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Analytics credentials missing',
            'error_code' => 'MISSING_CREDENTIALS'
        ]);
        exit;
    }

    try {
        $client = new BetaAnalyticsDataClient([
            'credentials' => CREDENTIALS_PATH
        ]);

        // Get daily metrics from GA4
        // Get daily metrics from GA4
        $response = $client->runReport([
            'property' => GA4_PROPERTY_ID,
            'dateRanges' => [
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
            'data' => $dailyData,
            'mock' => false
        ]);

    } catch (Throwable $e) {
        error_log("GA4 Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Failed to fetch analytics data',
            'error' => $e->getMessage()
        ]);
        exit;
    }
?>