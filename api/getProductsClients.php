<?php
// CORS headers — allow your frontend origin only
$allowedOrigin = 'https://sunleaftechnologies.co.ke';

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
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

// Get page & limit from query string (with defaults)
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// Optional filters
$search = isset($_GET['q']) ? trim($_GET['q']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';

// Build WHERE conditions
$where = [];
if ($category !== '') {
    $cat = $conn->real_escape_string($category);
    $where[] = "p.category LIKE '%$cat%'";
}
if ($search !== '') {
    // Split keywords by whitespace and OR them together for broader match
    $keywords = preg_split('/\s+/', $search);
    $kwConds = [];
    foreach ($keywords as $kw) {
        $kwe = $conn->real_escape_string($kw);
        $kwConds[] = "(p.name LIKE '%$kwe%' OR p.category LIKE '%$kwe%' OR p.description LIKE '%$kwe%')";
    }
    if (!empty($kwConds)) {
        $where[] = '(' . implode(' OR ', $kwConds) . ')';
    }
}

$whereSql = '';
if (!empty($where)) {
    $whereSql = 'WHERE ' . implode(' AND ', $where);
}

// First, get the total number of products (respect filters)
$countSql = "SELECT COUNT(*) AS total FROM products p $whereSql";
$countResult = $conn->query($countSql);
$totalRow = $countResult ? $countResult->fetch_assoc() : ['total' => 0];
$totalProducts = (int)($totalRow['total'] ?? 0);
$totalPages = (int)ceil($totalProducts / $limit);

// Now fetch the paginated product data
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
$whereSql
GROUP BY 
  p.id, p.main_image_url, p.name, p.slug, p.price, p.category
ORDER BY p.id DESC
LIMIT $limit OFFSET $offset
";

$result = $conn->query($sql);

if ($result) {
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $row['price'] = (float)$row['price'];
        $row['rating'] = round((float)$row['rating'], 1); // round rating to 1 decimal
        $row['review_count'] = isset($row['review_count']) ? (int)$row['review_count'] : 0;
        $row['stock_quantity'] = isset($row['stock_quantity']) ? (int)$row['stock_quantity'] : 0;
        $row['quantity'] = $row['stock_quantity'];

        // Consistency helpers (keep original keys for backward compatibility)
        $row['stockCount'] = $row['stock_quantity'];
        $row['reviewCount'] = $row['review_count'];
        $row['image'] = $row['main_image_url'];
        $row['inStock'] = $row['stock_quantity'] > 0;
        
        // Ensure slug is present
        if (empty($row['slug'])) {
             // Fallback: create a basic slug from name
             $row['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $row['name']), '-')) . '-' . $row['id'];
        }
        
        $products[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'currentPage' => $page,
        'totalPages' => $totalPages,
        'limit' => $limit
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Query failed: ' . $conn->error
    ]);
}

$conn->close();
exit;
