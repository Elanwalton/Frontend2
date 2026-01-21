<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

echo "GLOBAL AUDIT\n";

// 1. Total Reviews
$res = mysqli_query($conn, "SELECT COUNT(*) as total FROM reviews");
echo "Total Reviews in 'reviews' table: " . mysqli_fetch_assoc($res)['total'] . "\n";

// 2. Sample Products with meaningful descriptions
echo "\nProducts with descriptions (non-generic):\n";
$sql = "SELECT id, name, description FROM products WHERE description NOT LIKE '%Transform your home%' AND description != '' LIMIT 5";
$res = mysqli_query($conn, $sql);
while ($row = mysqli_fetch_assoc($res)) {
    echo "ID: " . $row['id'] . " | Name: " . $row['name'] . " | Desc: " . substr($row['description'], 0, 50) . "...\n";
}

// 3. Check for specific reviews
echo "\nLast 5 Reviews:\n";
$res = mysqli_query($conn, "SELECT id, product_id, customer_name, rating FROM reviews ORDER BY created_at DESC LIMIT 5");
while ($row = mysqli_fetch_assoc($res)) {
    echo "ID: " . $row['id'] . " | Product ID: " . $row['product_id'] . " | Author: " . $row['customer_name'] . " | Rating: " . $row['rating'] . "\n";
}
?>
