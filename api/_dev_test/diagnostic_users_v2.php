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

echo "Tables in database:\n";

foreach ($tables as $table) {
    if ($table === 'users') continue;
    
    $res = mysqli_query($conn, "SHOW CREATE TABLE `$table` text"); // Removed "text" which caused error before
    $res = mysqli_query($conn, "SHOW CREATE TABLE `$table` ");
    if (!$res) continue;
    
    $row = mysqli_fetch_assoc($res);
    $createHtml = $row['Create Table'] ?? '';
    
    if (stripos($createHtml, 'FOREIGN KEY') !== false && stripos($createHtml, 'user_id') !== false) {
        echo "Table: $table\n";
    }
}

mysqli_close($conn);
?>
