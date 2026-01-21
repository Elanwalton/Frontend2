<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$sql = "SELECT id, name, category, specifications FROM products";
$res = mysqli_query($conn, $sql);

echo "--- SPECIFICATION AUDIT ---\n";
while ($row = mysqli_fetch_assoc($res)) {
    echo "ID: " . $row['id'] . " | " . $row['name'] . "\n";
    echo "  Specs Column: " . ($row['specifications'] ?: "[NULL/EMPTY]") . "\n";
    echo "---------------------------\n";
}
?>
