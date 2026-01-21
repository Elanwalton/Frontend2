<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();
$res = mysqli_query($conn, 'DESCRIBE products');
while($row = mysqli_fetch_assoc($res)) {
    echo "{$row['Field']} | {$row['Type']}\n";
}
?>
