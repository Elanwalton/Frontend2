<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

$columns_to_add = [
    'highlights' => "ALTER TABLE products ADD COLUMN highlights JSON DEFAULT NULL",
    'specifications' => "ALTER TABLE products ADD COLUMN specifications JSON DEFAULT NULL",
    'reviews' => "ALTER TABLE products ADD COLUMN reviews JSON DEFAULT NULL",
    'badges' => "ALTER TABLE products ADD COLUMN badges JSON DEFAULT NULL",
    'colors' => "ALTER TABLE products ADD COLUMN colors JSON DEFAULT NULL",
    'sizes' => "ALTER TABLE products ADD COLUMN sizes JSON DEFAULT NULL"
];

$results = [];

foreach ($columns_to_add as $col_name => $sql) {
    try {
        $conn->query($sql);
        $results[$col_name] = 'Added successfully';
    } catch (Exception $e) {
        // Column might already exist
        $results[$col_name] = 'Column already exists or error: ' . $e->getMessage();
    }
}

sendSuccess(['results' => $results]);
?>
