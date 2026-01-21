<?php
require_once __DIR__ . '/ApiHelper.php';

header('Content-Type: text/plain');

$conn = getDbConnection();

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

echo "Database Connected Successfully!\n";
echo "--------------------------------\n";

// List Tables
echo "Tables:\n";
$sql = "SHOW TABLES";
$result = mysqli_query($conn, $sql);

if ($result) {
    while ($row = mysqli_fetch_row($result)) {
        echo "- " . $row[0] . "\n";
    }
} else {
    echo "Error listing tables: " . mysqli_error($conn) . "\n";
}

echo "--------------------------------\n";
echo "Checking specific tables:\n";

$tablesToCheck = ['products', 'categories', 'seo_metadata', 'url_redirects', 'search_keywords', 'reviews'];
foreach ($tablesToCheck as $table) {
    $checkSql = "SHOW TABLES LIKE '$table'";
    $checkResult = mysqli_query($conn, $checkSql);
    if (mysqli_num_rows($checkResult) > 0) {
        $countSql = "SELECT COUNT(*) as count FROM $table";
        $countResult = mysqli_query($conn, $countSql);
        $countRow = mysqli_fetch_assoc($countResult);
        echo "[OK] Table '$table' exists. Rows: " . $countRow['count'] . "\n";
        
        // If reviews, check columns
        if ($table === 'reviews') {
             echo "    -> Columns:\n";
             $colSql = "SHOW COLUMNS FROM reviews";
             $colResult = mysqli_query($conn, $colSql);
             while($c = mysqli_fetch_assoc($colResult)) { 
                 echo "       - " . $c['Field'] . "\n"; 
             }
        }
        if ($table === 'categories') {
             echo "    -> Columns: ";
             $colSql = "SHOW COLUMNS FROM categories";
             $colResult = mysqli_query($conn, $colSql);
             $cols = [];
             while($c = mysqli_fetch_assoc($colResult)) { $cols[] = $c['Field']; }
             echo implode(', ', $cols) . "\n";
        }
    } else {
        echo "[MISSING] Table '$table' does not exist.\n";
    }
}

mysqli_close($conn);
?>
