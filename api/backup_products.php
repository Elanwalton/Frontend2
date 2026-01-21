<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$sql = "SELECT * FROM products";
$res = mysqli_query($conn, $sql);
$products = [];
while ($row = mysqli_fetch_assoc($res)) {
    $products[] = $row;
}

$dir = __DIR__ . '/backups';
if (!is_dir($dir)) mkdir($dir, 0777, true);

$filename = $dir . '/products_backup_' . time() . '.json';
file_put_contents($filename, json_encode($products, JSON_PRETTY_PRINT));

echo "Backup created: $filename\n";
echo "Total products backed up: " . count($products) . "\n";
?>
