<?php
require_once __DIR__ . '/ApiHelper.php';

echo "Testing database connection...\n";

try {
    $conn = getDbConnection();
    echo "DB connection successful\n";
    
    // Test a simple query
    $result = $conn->query("SELECT COUNT(*) as count FROM products");
    $row = $result->fetch_assoc();
    echo "Products count: " . $row['count'] . "\n";
    
    // Test the actual query structure
    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.status = 'published' 
            ORDER BY p.created_at DESC 
            LIMIT 5";
    
    echo "Testing query: " . $sql . "\n";
    $result = $conn->query($sql);
    
    if ($result) {
        echo "Query successful, rows: " . $result->num_rows . "\n";
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo "First product: " . json_encode($products[0] ?? []) . "\n";
    } else {
        echo "Query failed: " . $conn->error . "\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>