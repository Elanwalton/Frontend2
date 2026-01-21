<?php
/**
 * Run migration: Add profile_picture column
 */

require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

try {
    echo "Running migration: Add profile_picture column...\n";
    
    $sql = file_get_contents(__DIR__ . '/migrations/009_add_profile_picture_column.sql');
    
    if ($conn->query($sql)) {
        echo "✓ Migration completed successfully!\n";
        echo "✓ profile_picture column added to users table\n";
    } else {
        echo "✗ Migration failed: " . $conn->error . "\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

$conn->close();
