<?php
// Test if autoload.php exists and works
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die(json_encode([
        'success' => false,
        'error' => 'autoload.php MISSING - Composer installation incomplete',
        'fix' => 'Run: composer install --optimize-autoloader'
    ]));
}

require_once __DIR__ . '/vendor/autoload.php';

echo json_encode([
    'success' => true,
    'message' => 'autoload.php found and loaded!',
    'classes_available' => [
        'BetaAnalyticsDataClient' => class_exists('Google\Analytics\Data\V1beta\BetaAnalyticsDataClient'),
        'DateRange' => class_exists('Google\Analytics\Data\V1beta\DateRange'),
        'Dimension' => class_exists('Google\Analytics\Data\V1beta\Dimension'),
        'Metric' => class_exists('Google\Analytics\Data\V1beta\Metric')
    ]
]);
?>