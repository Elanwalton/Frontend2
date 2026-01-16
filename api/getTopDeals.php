<?php
require_once __DIR__ . '/ApiHelper.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDbConnection();

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// Get parameters
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 8;
$type = isset($_GET['type']) ? $_GET['type'] : 'auto'; // 'auto' or 'featured'

if ($type === 'featured') {
    // Get manually featured products
    $sql = "
    SELECT 
        p.id, 
        p.main_image_url, 
        p.name, 
        p.price,
        p.original_price,
        p.discount_percentage,
        p.category, 
        p.stock_quantity,
        p.description,
        p.is_featured,
        p.featured_priority,
        IFNULL(AVG(r.rating), 0) AS rating, 
        COUNT(r.id) AS review_count
    FROM 
        products p
    LEFT JOIN 
        reviews r ON p.id = r.product_id
    WHERE 
        p.is_featured = TRUE
    GROUP BY 
        p.id, p.main_image_url, p.name, p.price, p.category, 
        p.stock_quantity, p.description, p.is_featured, p.featured_priority
    ORDER BY 
        p.featured_priority DESC, p.id DESC
    LIMIT $limit
    ";
} else {
    // Auto mode (safe): rank by rating and review_count only
    $sql = "
    SELECT 
        p.id, 
        p.main_image_url, 
        p.name, 
        p.price,
        p.category, 
        p.stock_quantity,
        p.description,
        IFNULL(AVG(r.rating), 0) AS rating, 
        COUNT(r.id) AS review_count
    FROM 
        products p
    LEFT JOIN 
        reviews r ON p.id = r.product_id
    GROUP BY 
        p.id, p.main_image_url, p.name, p.price, p.category, p.stock_quantity, p.description
    ORDER BY 
        rating DESC, review_count DESC, p.id DESC
    LIMIT $limit
    ";
}

$result = $conn->query($sql);

if ($result) {
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $row['rating'] = round((float)$row['rating'], 1);
        $row['deal_score'] = isset($row['deal_score']) ? round((float)$row['deal_score'], 2) : null;

        // Calculate savings only if original_price is available in the selected columns
        if (isset($row['original_price']) && $row['original_price'] > $row['price']) {
            $row['savings'] = $row['original_price'] - $row['price'];
            $row['savings_percentage'] = round((($row['savings'] / $row['original_price']) * 100), 0);
        }
        
        $products[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'type' => $type,
        'count' => count($products)
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Query failed: ' . $conn->error
    ]);
}

$conn->close();
?>