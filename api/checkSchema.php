<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

$result = $conn->query("DESCRIBE products");

if ($result) {
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row['Field'];
    }
    sendSuccess(['columns' => $columns]);
} else {
    sendError(500, 'Failed to get table schema: ' . $conn->error);
}
?>
