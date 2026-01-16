<?php
/**
 * M-Pesa Payments Table Migration
 * Adds M-Pesa specific fields to the payments table
 */

require __DIR__ . '/../connection.php';

echo "Running M-Pesa payments table migration...\n";

try {
    // Update currency default to KES for new records
    $conn->query("ALTER TABLE payments MODIFY COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'KES'");

    echo "M-Pesa payments table migration completed successfully!\n";
    echo "Updated currency default to KES\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
} finally {
    if (isset($conn)) $conn->close();
}
?>
