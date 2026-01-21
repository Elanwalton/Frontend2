<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$sql = "SELECT id, name, category, specifications FROM products WHERE specifications IS NOT NULL AND specifications != ''";
$res = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($res)) {
    echo "ID: {$row['id']} | Name: {$row['name']}\n";
    echo "Category: {$row['category']}\n";
    echo "Specs: {$row['specifications']}\n";
    echo "-------------------\n";
}
?>
