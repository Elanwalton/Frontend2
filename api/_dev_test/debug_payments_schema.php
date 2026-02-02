<?php
header('Content-Type: application/json');
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$schema = [];

foreach (['payments', 'orders'] as $table) {
    $columns = [];
    $result = $conn->query("DESCRIBE $table");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $columns[] = $row;
        }
        $schema[$table] = $columns;
    } else {
        $schema[$table] = "Error: " . $conn->error;
    }
}

echo json_encode($schema, JSON_PRETTY_PRINT);
?>
