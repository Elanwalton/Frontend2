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

// Include Google Analytics libraries if available
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Check if GA4 credentials are available
if (!file_exists(CREDENTIALS_PATH)) {
    // Return mock data if credentials are not configured
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

    sendSuccess([
        'data' => $mockData,
        'totalSessions' => 29940,
        'timestamp' => time(),
        'mock' => true
    ]);
}

try {
    // Check if GA4 classes are available before using them
    if (class_exists('Google\Analytics\Data\V1beta\Client\BetaAnalyticsDataClient')) {
        // Initialize GA4 client
        $client = new BetaAnalyticsDataClient([
            'credentials' => CREDENTIALS_PATH
        ]);

        // Get real GA4 data
        $request = new RunReportRequest([
            'property' => GA4_PROPERTY_ID,
            'date_ranges' => [
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

        $response = $client->runReport($request);

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
        foreach ($data as &$item) {
            $item['percentage'] = round(($item['sessions'] / $totalSessions) * 100);
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

} catch (Exception $e) {
    // Fallback to mock data on any error
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

    sendSuccess([
        'data' => $mockData,
        'totalSessions' => 29940,
        'timestamp' => time(),
        'mock' => true,
        'error' => $e->getMessage()
    ]);
}
?>