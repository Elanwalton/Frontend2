<?php
require 'connection.php';

$tables = [];
$res = mysqli_query($conn, "SHOW TABLES");
while ($row = mysqli_fetch_array($res)) {
    $tables[] = $row[0];
}

echo "Tables in database:\n";
print_r($tables);

foreach ($tables as $table) {
    if ($table === 'users') continue;
    $res = mysqli_query($conn, "SHOW CREATE TABLE `$table` text");
    $row = mysqli_fetch_assoc($res);
    if (strpos($row['Create Table'], 'FOREIGN KEY') !== false && strpos($row['Create Table'], 'user_id') !== false) {
        echo "\nTable `$table` has a foreign key referencing user_id!\n";
    }
}
?>
