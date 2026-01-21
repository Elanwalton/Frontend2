<?php
// CORS headers — allow both development and production origins
$allowedOrigins = ['https://sunleaftechnologies.co.ke', 'http://localhost:3000'];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
}

// Handle OPTIONS preflight request and exit early
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

// Get the request body (recently viewed product IDs)
$input = json_decode(file_get_contents('php://input'), true);
$viewedIds = isset($input['viewedIds']) && is_array($input['viewedIds']) ? $input['viewedIds'] : [];

// Get limit from query string or default to 8
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 8;

$products = [];

// Strategy: If user has viewed products, recommend from same categories
if (!empty($viewedIds)) {
    // Sanitize the viewed IDs
    $sanitizedIds = array_map('intval', $viewedIds);
    $idsString = implode(',', $sanitizedIds);
    
    // Get categories of viewed products
    $categorySql = "
        SELECT DISTINCT category 
        FROM products 
        WHERE id IN ($idsString) AND category IS NOT NULL AND category != ''
    ";
    
    $categoryResult = $conn->query($categorySql);
    $categories = [];
    
    if ($categoryResult) {
        while ($row = $categoryResult->fetch_assoc()) {
            $categories[] = $conn->real_escape_string($row['category']);
        }
    }
    
    // If we found categories, get highly-rated products from those categories
    if (!empty($categories)) {
        $categoryConditions = [];
        foreach ($categories as $cat) {
            $categoryConditions[] = "p.category LIKE '%$cat%'";
        }
        $categoryWhere = '(' . implode(' OR ', $categoryConditions) . ')';
        
        // Get recommended products from same categories, excluding already viewed
        $sql = "
            SELECT 
                p.id, 
                p.main_image_url, 
                p.name, 
                p.slug,
                p.price, 
                p.category, 
                MAX(COALESCE(p.stock_quantity, p.quantity, 0)) AS stock_quantity,
                IFNULL(AVG(r.rating), 0) AS rating, 
                COUNT(r.id) AS review_count
            FROM 
                products p
            LEFT JOIN 
                reviews r ON p.id = r.product_id
            WHERE 
                $categoryWhere
                AND p.id NOT IN ($idsString)
            GROUP BY 
                p.id, p.main_image_url, p.name, p.slug, p.price, p.category
            HAVING 
                rating >= 3.5 OR review_count = 0
            ORDER BY 
                rating DESC, review_count DESC, p.id DESC
            LIMIT $limit
        ";
        
        $result = $conn->query($sql);
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $products[] = formatProduct($row);
            }
        }
    }
}

// Fallback: If we don't have enough products, get top-rated products overall
if (count($products) < $limit) {
    $remaining = $limit - count($products);
    
    // Build exclusion list (viewed products + already recommended products)
    $excludeIds = array_merge($viewedIds, array_column($products, 'id'));
    $excludeString = !empty($excludeIds) ? implode(',', array_map('intval', $excludeIds)) : '0';
    
    $fallbackSql = "
        SELECT 
            p.id, 
            p.main_image_url, 
            p.name, 
            p.slug,
            p.price, 
            p.category, 
            MAX(COALESCE(p.stock_quantity, p.quantity, 0)) AS stock_quantity,
            IFNULL(AVG(r.rating), 0) AS rating, 
            COUNT(r.id) AS review_count
        FROM 
            products p
        LEFT JOIN 
            reviews r ON p.id = r.product_id
        WHERE 
            p.id NOT IN ($excludeString)
        GROUP BY 
            p.id, p.main_image_url, p.name, p.slug, p.price, p.category
        ORDER BY 
            rating DESC, review_count DESC, p.id DESC
        LIMIT $remaining
    ";
    
    $fallbackResult = $conn->query($fallbackSql);
    
    if ($fallbackResult) {
        while ($row = $fallbackResult->fetch_assoc()) {
            $products[] = formatProduct($row);
        }
    }
}

// Helper function to format product data
function formatProduct($row) {
    $row['price'] = (float)$row['price'];
    $row['rating'] = round((float)$row['rating'], 1);
    $row['review_count'] = isset($row['review_count']) ? (int)$row['review_count'] : 0;
    $row['stock_quantity'] = isset($row['stock_quantity']) ? (int)$row['stock_quantity'] : 0;
    $row['quantity'] = $row['stock_quantity'];
    
    // Consistency helpers
    $row['stockCount'] = $row['stock_quantity'];
    $row['reviewCount'] = $row['review_count'];
    $row['image'] = $row['main_image_url'];
    $row['inStock'] = $row['stock_quantity'] > 0;
    
    // Ensure slug is present
    if (empty($row['slug'])) {
        $row['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $row['name']), '-')) . '-' . $row['id'];
    }
    
    return $row;
}

echo json_encode([
    'success' => true,
    'data' => $products,
    'count' => count($products),
    'personalized' => !empty($viewedIds)
]);

$conn->close();
exit;
