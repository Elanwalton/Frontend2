<?php
require_once 'ApiHelper.php';
$db = getDbConnection();

$result = $db->query("SHOW TABLES");
if ($result) {
    while ($row = $result->fetch_array()) {
        echo $row[0] . "\n";
    }
} else {
    echo "Error: " . $db->error;
}
?>
