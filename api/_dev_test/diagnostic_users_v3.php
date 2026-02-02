<?php
require 'connection.php';

$tables = [];
$res = mysqli_query($conn, "SHOW TABLES");
if (!$res) {
    die("Query failed: " . mysqli_error($conn));
}

while ($row = mysqli_fetch_array($res)) {
    $tables[] = $row[0];
}

echo "Tables referencing users (user_id):\n";

foreach ($tables as $table) {
    if ($table === 'users') continue;
    
    // Check if table has a user_id column
    $colRes = mysqli_query($conn, "SHOW COLUMNS FROM `$table` LIKE 'user_id'");
    if ($colRes && mysqli_num_rows($colRes) > 0) {
        echo "Table: $table\n";
    }
}

mysqli_close($conn);
?>
