<?php
require_once 'ApiHelper.php';
$db = getDbConnection();

$tables = ['url_redirects', 'reviews'];

foreach ($tables as $table) {
    echo "--- Table: $table ---\n";
    $result = $db->query("DESCRIBE $table");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']}\n";
        }
    } else {
        echo "Table does not exist.\n";
    }
}
?>
