<?php
require_once 'analyticsConfig.php';

use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;

header('Content-Type: application/json');

try {
    // Test 1: Check if files exist
    if (!file_exists(CREDENTIALS_PATH)) {
        throw new Exception('Credentials file not found at: ' . CREDENTIALS_PATH);
    }
    
    if (GA4_PROPERTY_ID === 'properties/YOUR_GA4_PROPERTY_ID') {
        throw new Exception('GA4 Property ID not configured');
    }
    
    // Test 2: Check if classes are loaded
    if (!class_exists('Google\Analytics\Data\V1beta\BetaAnalyticsDataClient')) {
        throw new Exception('Google Analytics API classes not loaded');
    }
    
    // Test 3: Try to initialize client
    $client = new BetaAnalyticsDataClient([
        'credentials' => CREDENTIALS_PATH
    ]);
    
    // Test 4: Try a simple API call
    $response = $client->runReport([
        'property' => GA4_PROPERTY_ID,
        'dateRanges' => [
            new DateRange([
                'start_date' => '7daysAgo', // Short period for quick test
                'end_date' => 'today',
            ]),
        ],
        'dimensions' => [
            new Dimension(['name' => 'sessionSource']),
        ],
        'metrics' => [
            new Metric(['name' => 'sessions']),
        ],
        'limit' => 5 // Small limit for testing
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => '✅ GA4 API Connection Successful!',
        'tests_passed' => [
            'credentials_file' => true,
            'property_id' => true,
            'api_classes' => true,
            'client_initialization' => true,
            'api_call' => true
        ],
        'property_id' => GA4_PROPERTY_ID,
        'data_sample' => 'API is returning real GA4 data'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Setup issue: ' . $e->getMessage(),
        'next_steps' => [
            'Check GA4 Property ID is correct',
            'Verify service account has Viewer role in GA4',
            'Ensure JSON file is in correct location'
        ]
    ]);
}
?>