<?php
// Test Script for Reviews
require_once __DIR__ . '/ApiHelper.php';

// Simulate POST to submitReview
echo "1. Testing Submit Review...\n";
$url = 'http://localhost/frontend2-dev/api/submitReview.php';
$data = [
    'product_id' => 16,
    'author' => 'Test PHP',
    'rating' => 4.5,
    'comment' => 'Testing via PHP script',
    'pros' => 'Works',
    'cons' => 'None',
    'would_recommend' => true
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "ERROR: Failed to submit review\n";
    print_r(error_get_last());
} else {
    echo "Response: " . $result . "\n";
}

echo "\n2. Testing Get Reviews...\n";
$getUrl = 'http://localhost/frontend2-dev/api/getProductReviews.php?product_id=16';
$getResult = file_get_contents($getUrl);

if ($getResult === FALSE) {
    echo "ERROR: Failed to get reviews\n";
    print_r(error_get_last());
} else {
    echo "Response: " . $getResult . "\n";
}
?>
