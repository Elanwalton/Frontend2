<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$sql = "SELECT id, name, description, specifications, features FROM products LIMIT 3";
$result = mysqli_query($conn, $sql);

echo "--- DATA SOURCE VERIFICATION ---\n";
while ($row = mysqli_fetch_assoc($result)) {
    echo "Product: " . $row['name'] . " (ID: " . $row['id'] . ")\n";
    echo "Description (DB): " . (empty($row['description']) ? "[EMPTY]" : "EXISTS (" . strlen($row['description']) . " chars)") . "\n";
    echo "Specifications (DB): " . (empty($row['specifications']) ? "[EMPTY]" : $row['specifications']) . "\n";
    echo "Features (DB): " . (empty($row['features']) ? "[EMPTY]" : $row['features']) . "\n";
    echo "---------------------------\n";
}
?>
