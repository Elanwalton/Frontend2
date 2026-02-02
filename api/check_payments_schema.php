<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

echo "<h1>Payments Table Schema Check</h1>";

$result = $conn->query("SHOW CREATE TABLE payments");
if ($result) {
    $row = $result->fetch_assoc();
    echo "<h3>Create Table Statement:</h3>";
    echo "<pre style='background:#f4f4f4; padding:10px; border:1px solid #ccc;'>" . htmlspecialchars($row['Create Table']) . "</pre>";
    
    // Check for 'success' in the definition
    if (strpos($row['Create Table'], "'success'") !== false) {
        echo "<p style='color:green'>✅ 'success' is present in the ENUM definition.</p>";
    } else {
        echo "<p style='color:red'>❌ 'success' is MISSING from the ENUM definition!</p>";
        echo "<p>Your table likely has: ENUM('pending', 'paid', ...) instead of 'success'.</p>";
    }
} else {
    echo "<p style='color:red'>❌ Could not find 'payments' table: " . $conn->error . "</p>";
}
?>
