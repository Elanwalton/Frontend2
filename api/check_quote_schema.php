<?php
// Check existing database schema for quotation system
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

echo "=== CHECKING EXISTING DATABASE SCHEMA ===\n\n";

// Check if quote_requests table exists
echo "1. Checking quote_requests table...\n";
$result = $conn->query("SHOW TABLES LIKE 'quote_requests'");
if ($result && $result->num_rows > 0) {
    echo "   ✓ quote_requests table EXISTS\n";
    $cols = $conn->query("DESCRIBE quote_requests");
    echo "   Columns:\n";
    while ($col = $cols->fetch_assoc()) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
    }
} else {
    echo "   ✗ quote_requests table DOES NOT EXIST\n";
}
echo "\n";

// Check quotations table structure
echo "2. Checking quotations table...\n";
$result = $conn->query("SHOW TABLES LIKE 'quotations'");
if ($result && $result->num_rows > 0) {
    echo "   ✓ quotations table EXISTS\n";
    $cols = $conn->query("DESCRIBE quotations");
    echo "   Columns:\n";
    $hasAiGenerated = false;
    $hasReviewedBy = false;
    $hasReviewedAt = false;
    $hasRequestId = false;
    
    while ($col = $cols->fetch_assoc()) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
        if ($col['Field'] === 'is_ai_generated') $hasAiGenerated = true;
        if ($col['Field'] === 'reviewed_by') $hasReviewedBy = true;
        if ($col['Field'] === 'reviewed_at') $hasReviewedAt = true;
        if ($col['Field'] === 'request_id') $hasRequestId = true;
    }
    
    echo "\n   Missing columns:\n";
    if (!$hasAiGenerated) echo "   - is_ai_generated\n";
    if (!$hasReviewedBy) echo "   - reviewed_by\n";
    if (!$hasReviewedAt) echo "   - reviewed_at\n";
    if (!$hasRequestId) echo "   - request_id\n";
    if ($hasAiGenerated && $hasReviewedBy && $hasReviewedAt && $hasRequestId) {
        echo "   (None - all columns exist)\n";
    }
} else {
    echo "   ✗ quotations table DOES NOT EXIST\n";
}
echo "\n";

// Check admin_settings table
echo "3. Checking admin_settings table...\n";
$result = $conn->query("SHOW TABLES LIKE 'admin_settings'");
if ($result && $result->num_rows > 0) {
    echo "   ✓ admin_settings table EXISTS\n";
    $cols = $conn->query("DESCRIBE admin_settings");
    echo "   Columns:\n";
    while ($col = $cols->fetch_assoc()) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
    }
    
    // Check if AI setting exists
    $aiSetting = $conn->query("SELECT * FROM admin_settings WHERE setting_key = 'ai_quote_generation_enabled'");
    if ($aiSetting && $aiSetting->num_rows > 0) {
        $setting = $aiSetting->fetch_assoc();
        echo "   ✓ AI toggle setting EXISTS (value: {$setting['setting_value']})\n";
    } else {
        echo "   ✗ AI toggle setting DOES NOT EXIST\n";
    }
} else {
    echo "   ✗ admin_settings table DOES NOT EXIST\n";
}
echo "\n";

// Check quote_items table
echo "4. Checking quote_items table...\n";
$result = $conn->query("SHOW TABLES LIKE 'quote_items'");
if ($result && $result->num_rows > 0) {
    echo "   ✓ quote_items table EXISTS\n";
    $cols = $conn->query("DESCRIBE quote_items");
    echo "   Columns:\n";
    while ($col = $cols->fetch_assoc()) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
    }
} else {
    echo "   ✗ quote_items table DOES NOT EXIST\n";
}
echo "\n";

echo "=== SCHEMA CHECK COMPLETE ===\n";

$conn->close();
