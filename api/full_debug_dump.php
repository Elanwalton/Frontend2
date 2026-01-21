<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

function dumpTable($conn, $table, $idField, $id) {
    echo "--- Table: $table (ID: $id) ---\n";
    $sql = "SELECT * FROM $table WHERE $idField = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    if ($data) {
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "NOT FOUND\n";
    }
}

$id = 1; // Assuming the user is looking at the first product
dumpTable($conn, 'products', 'id', $id);
echo "\n";
echo "--- Reviews for Product ID: $id ---\n";
$sql = "SELECT * FROM reviews WHERE product_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    echo json_encode($row, JSON_PRETTY_PRINT) . "\n";
}
?>
