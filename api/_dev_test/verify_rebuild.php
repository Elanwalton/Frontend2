<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$ids = [1, 10, 20, 34];
foreach ($ids as $id) {
    $res = mysqli_query($conn, "SELECT name, sku, description, features, specifications FROM products WHERE id = $id");
    $row = mysqli_fetch_assoc($res);
    echo "--- CHECKING ID: $id ---\n";
    echo "Name: {$row['name']}\n";
    echo "SKU: {$row['sku']}\n";
    echo "Features: " . substr($row['features'], 0, 50) . "...\n";
    echo "Specs: " . substr($row['specifications'], 0, 50) . "...\n";
}

$res = mysqli_query($conn, "SELECT COUNT(*) as total FROM products");
echo "\nTotal Product Count: " . mysqli_fetch_assoc($res)['total'] . "\n";
?>
