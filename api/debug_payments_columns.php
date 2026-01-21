<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$required_columns = [
    'transaction_id',
    'order_id',
    'amount',
    'currency',
    'payment_method',
    'status',
    'customer_email',
    'customer_name',
    'notes',
    'created_at',
    'processed_at'
];

$result = $conn->query("DESCRIBE payments");
$existing_columns = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $existing_columns[] = $row['Field'];
    }
}

echo "Existing columns: " . implode(', ', $existing_columns) . "\n";

foreach ($required_columns as $col) {
    if (in_array($col, $existing_columns)) {
        echo "$col: OK\n";
    } else {
        echo "$col: MISSING\n";
    }
}
?>
