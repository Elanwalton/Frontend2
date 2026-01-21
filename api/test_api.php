<?php
// Mock server environment for API test
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['page'] = 1;
$_GET['limit'] = 10;

echo "--- TESTING getProductsClients.php ---\n";
ob_start();
include 'getProductsClients.php';
$output = ob_get_clean();

echo "Raw Output:\n" . $output . "\n";

$json = json_decode($output, true);
if ($json) {
    echo "Decoded Success: " . ($json['success'] ? 'Yes' : 'No') . "\n";
    echo "Product Count in Response: " . count($json['data'] ?? []) . "\n";
    if (!empty($json['data'])) {
        echo "Example Product: " . $json['data'][0]['name'] . "\n";
    }
} else {
    echo "Failed to decode JSON output.\n";
}
