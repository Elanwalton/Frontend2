<?php
/**
 * Run performance indexes migration
 */
require_once __DIR__ . '/../ApiHelper.php';

$conn = getDbConnection();

echo "Running performance indexes migration...\n\n";

$sql = file_get_contents(__DIR__ . '/add_performance_indexes.sql');

// Split by semicolon and execute each statement
$statements = array_filter(array_map('trim', explode(';', $sql)));

$success = 0;
$errors = 0;

foreach ($statements as $statement) {
    if (empty($statement)) continue;
    
    try {
        if ($conn->query($statement)) {
            $success++;
            echo "✓ Executed: " . substr($statement, 0, 60) . "...\n";
        } else {
            $errors++;
            echo "✗ Error: " . $conn->error . "\n";
        }
    } catch (Exception $e) {
        $errors++;
        echo "✗ Exception: " . $e->getMessage() . "\n";
    }
}

echo "\n";
echo "Summary: $success successful, $errors errors\n";

if ($errors === 0) {
    echo "✓ All performance indexes created successfully!\n";
}

$conn->close();
?>
