<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$res = mysqli_query($conn, "SELECT COUNT(*) as total FROM products WHERE description = '' OR description IS NULL");
$empty = mysqli_fetch_assoc($res)['total'];

$res = mysqli_query($conn, "SELECT COUNT(*) as total FROM products WHERE description != '' AND description IS NOT NULL");
$real = mysqli_fetch_assoc($res)['total'];

echo "Products with EMPTY description: $empty\n";
echo "Products with REAL description: $real\n";

if ($real > 0) {
    echo "\nSample Real Products:\n";
    $res = mysqli_query($conn, "SELECT id, name, slug FROM products WHERE description != '' LIMIT 5");
    while ($row = mysqli_fetch_assoc($res)) {
        echo "ID: {$row['id']} | Slug: {$row['slug']} | Name: {$row['name']}\n";
    }
}
?>
