<?php
// Test Script for Newsletter Subscription
$url = 'http://localhost/frontend2-dev/api/subscribe.php';

echo "1. Testing New Subscription...\n";
$email = 'test-' . time() . '@example.com';
$data = ['email' => $email];

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
echo "Response: " . $result . "\n";

echo "\n2. Testing Duplicate Subscription...\n";
$resultDuplicate = file_get_contents($url, false, $context);
echo "Response: " . $resultDuplicate . "\n";

echo "\n3. Testing Invalid Email...\n";
$dataInvalid = ['email' => 'not-an-email'];
$options['http']['content'] = json_encode($dataInvalid);
$contextInvalid  = stream_context_create($options);
$resultInvalid = file_get_contents($url, false, $contextInvalid);
echo "Response: " . $resultInvalid . "\n";
?>
