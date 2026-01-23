<?php
// Run database migrations for quotation system refinement
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

echo "=== RUNNING QUOTATION SYSTEM MIGRATIONS ===\n\n";

// Migration 1: Update quote_requests table
echo "1. Updating quote_requests table...\n";
try {
    // Add request_number column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS request_number VARCHAR(20) UNIQUE AFTER id");
    echo "   ✓ Added request_number column\n";

    // Add customer_name column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) AFTER request_number");
    echo "   ✓ Added customer_name column\n";

    // Add customer_email column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER customer_name");
    echo "   ✓ Added customer_email column\n";

    // Add customer_phone column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) AFTER customer_email");
    echo "   ✓ Added customer_phone column\n";

    // Add appliances column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS appliances TEXT AFTER customer_phone");
    echo "   ✓ Added appliances column\n";
    
    // Add analysis_data column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS analysis_data JSON AFTER appliances");
    echo "   ✓ Added analysis_data column\n";
    
    // Add ai_quote_id column
    $conn->query("ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS ai_quote_id VARCHAR(50) AFTER status");
    echo "   ✓ Added ai_quote_id column\n";
    
    // Update status enum
    $conn->query("ALTER TABLE quote_requests MODIFY COLUMN status ENUM('pending', 'reviewed', 'quoted', 'cancelled', 'processing', 'sent', 'accepted', 'expired', 'rejected') DEFAULT 'pending'");
    echo "   ✓ Updated status enum\n";
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Migration 2: Add columns to quotations table
echo "2. Updating quotations table...\n";
try {
    // Add is_ai_generated column
    $conn->query("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE AFTER status");
    echo "   ✓ Added is_ai_generated column\n";
    
    // Add reviewed_by column
    $conn->query("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS reviewed_by INT AFTER is_ai_generated");
    echo "   ✓ Added reviewed_by column\n";
    
    // Add reviewed_at column
    $conn->query("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL AFTER reviewed_by");
    echo "   ✓ Added reviewed_at column\n";
    
    // Add request_id column
    $conn->query("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS request_id INT AFTER reviewed_at");
    echo "   ✓ Added request_id column\n";
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Migration 3: Create admin_settings table
echo "3. Creating admin_settings table...\n";
try {
    $sql = "CREATE TABLE IF NOT EXISTS admin_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description VARCHAR(255),
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->query($sql);
    echo "   ✓ Created admin_settings table\n";
    
    // Insert default AI setting
    $conn->query("INSERT INTO admin_settings (setting_key, setting_value, description) 
        VALUES ('ai_quote_generation_enabled', 'true', 'Enable or disable AI-powered quote generation from client requests')
        ON DUPLICATE KEY UPDATE setting_key = setting_key");
    echo "   ✓ Inserted default AI toggle setting\n";
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}
echo "\n";

echo "=== MIGRATIONS COMPLETE ===\n";

$conn->close();
