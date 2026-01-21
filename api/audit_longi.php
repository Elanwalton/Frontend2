<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$sql = "SELECT id, name, slug, description, specifications FROM products WHERE name LIKE '%Longi%' OR slug LIKE '%longi%'";
$res = mysqli_query($conn, $sql);

echo "--- LONGI DATA AUDIT ---\n";
while ($row = mysqli_fetch_assoc($res)) {
    echo "ID: " . $row['id'] . "\n";
    echo "Name: " . $row['name'] . "\n";
    echo "Slug: " . $row['slug'] . "\n";
    echo "Description in DB: " . ($row['description'] ?: "[EMPTY]") . "\n";
    echo "Specs in DB: " . ($row['specifications'] ?: "[EMPTY]") . "\n";
    echo "---------------------------\n";
}
?>
