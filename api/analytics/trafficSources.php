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

// Include Google Analytics libraries (now installed via composer)
require_once __DIR__ . '/../vendor/autoload.php';

// Check if GA4 credentials are available
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
    // Check if GA4 classes are available before using them
    if (class_exists('Google\Analytics\Data\V1beta\BetaAnalyticsDataClient')) {
        // Initialize GA4 client
        $client = new BetaAnalyticsDataClient([
            'credentials' => CREDENTIALS_PATH
        ]);

        // Get real GA4 data
        $response = $client->runReport([
            'property' => GA4_PROPERTY_ID,
            'dateRanges' => [
                new DateRange([
                    'start_date' => '30daysAgo',
                    'end_date' => 'today',
                ]),
            ],
            'dimensions' => [
                new Dimension(['name' => 'sessionSourceMedium']),
            ],
            'metrics' => [
                new Metric(['name' => 'sessions']),
                new Metric(['name' => 'totalUsers']),
            ],
        ]);

        // Process real data...
        $data = [];
        $totalSessions = 0;

        foreach ($response->getRows() as $row) {
            $sourceMedium = $row->getDimensionValues()[0]->getValue();
            $sessions = $row->getMetricValues()[0]->getValue();
            $users = $row->getMetricValues()[1]->getValue();
            
            $data[] = [
                'source' => $sourceMedium,
                'sessions' => (int)$sessions,
                'users' => (int)$users,
                'percentage' => 0 // Will be calculated
            ];
            $totalSessions += (int)$sessions;
        }

        // Calculate percentages
        if ($totalSessions > 0) {
            foreach ($data as &$item) {
                $item['percentage'] = round(($item['sessions'] / $totalSessions) * 100);
            }
        }

        sendSuccess([
            'data' => $data,
            'totalSessions' => $totalSessions,
            'timestamp' => time(),
            'mock' => false
        ]);

    } else {
        throw new Exception('Google Analytics libraries not available');
    }

} catch (Throwable $e) {
    error_log("GA4 Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to fetch traffic source data',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>