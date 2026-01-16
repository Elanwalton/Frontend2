<?php
header("Content-Type: application/json");

// Load ApiHelper for proper CORS handling
require_once 'ApiHelper.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDbConnection();

// Check connection
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// Get limit parameter (default to 10)
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

// Query to get top selling products based on revenue
$sql = "SELECT 
    id,
    name,
    description,
    category,
    status,
    revenue,
    price,
    quantity,
    rating,
    (revenue / NULLIF(price, 0)) as units_sold
FROM products 
WHERE status != 'Out of Stock'
ORDER BY revenue DESC 
LIMIT ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $limit);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $products = [];
    
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'category' => $row['category'],
            'status' => $row['status'],
            'revenue' => (float)$row['revenue'],
            'price' => (float)$row['price'],
            'quantity' => (int)$row['quantity'],
            'rating' => (float)$row['rating'],
            'units_sold' => (int)$row['units_sold']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'count' => count($products)
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Query failed: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
