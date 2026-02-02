<?php
// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_CONTENT_TYPE'] = 'application/json';

// Mock input
$input = json_encode([
    'firstName' => 'Test',
    'lastName' => 'User',
    'email' => 'test_internal@example.com',
    'phone' => '1234567890',
    'message' => 'This is an internal test message.'
]);

// Override file_get_contents for php://input is hard in CLI.
// Instead, I'll modify contact.php slightly to accept a mock input via a function if needed,
// OR just rely on a separate script that inserts directly to prove the logic is sound.
// BETTER: I'll use a script that uses curl from PHP to hit the endpoint.

$ch = curl_init('http://localhost/frontend2-dev/api/contact.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
