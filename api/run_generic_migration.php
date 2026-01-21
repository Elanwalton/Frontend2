<?php
// Usage: php api/run_generic_migration.php path/to/file.sql

if (php_sapi_name() !== 'cli') {
    die("Must be run from CLI");
}

if ($argc < 2) {
    die("Usage: php api/run_generic_migration.php <sql_file_path>\n");
}

$sqlFile = $argv[1];

if (!file_exists($sqlFile)) {
    die("Error: SQL file not found: $sqlFile\n");
}

$sqlContent = file_get_contents($sqlFile);

if (empty(trim($sqlContent))) {
    die("Error: SQL file is empty\n");
}

// Adjust relative path for connection include depending on where script is located
// If this script is in api/, connection is in api/
require_once __DIR__ . '/connection.php';

if (!$conn) {
    die("Database connection failed\n");
}

echo "Running migration: $sqlFile\n";

// Rudimentary split by ; to handle multiple statements
// This is not perfect (e.g. ; inside strings) but suffices for simple schema migrations
$queries = explode(';', $sqlContent);

foreach ($queries as $query) {
    $query = trim($query);
    if (!empty($query)) {
        if (mysqli_query($conn, $query)) {
            echo " [OK] Executed query.\n";
        } else {
            echo " [ERROR] Failed: " . mysqli_error($conn) . "\n";
            echo " Query: " . substr($query, 0, 100) . "...\n";
            exit(1);
        }
    }
}

echo "Migration Complete.\n";
mysqli_close($conn);
?>
