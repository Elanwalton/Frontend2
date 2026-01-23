<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get pagination and filter parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;
$search = isset($_GET['search']) ? $_GET['search'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';

// Build the query with filters
$query = "SELECT id, name, category, price, original_price as originalPrice, discount_percentage as discount, rating, review_count as reviewCount, thumbnail_urls as images, main_image_url, description, highlights, status, quantity, stock_quantity, colors, sizes, specifications, reviews, badges, created_at, updated_at FROM products WHERE 1=1";
$params = [];
$types = "";

// Add search filter
if (!empty($search)) {
    $query .= " AND (name LIKE ? OR description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $types .= "ss";
}

// Add category filter
if (!empty($category) && $category !== 'all') {
    $query .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

// Add status filter
if (!empty($status) && $status !== 'all') {
    $query .= " AND status = ?";
    $params[] = $status;
    $types .= "s";
}

// Add pagination
$query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= "ii";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $row['images'] = !empty($row['images']) ? json_decode($row['images'], true) : [];
    $row['highlights'] = !empty($row['highlights']) ? json_decode($row['highlights'], true) : [];
    $row['colors'] = !empty($row['colors']) ? json_decode($row['colors'], true) : [];
    $row['sizes'] = !empty($row['sizes']) ? json_decode($row['sizes'], true) : [];
    $row['specifications'] = !empty($row['specifications']) ? json_decode($row['specifications'], true) : [];
    $row['reviews'] = !empty($row['reviews']) ? json_decode($row['reviews'], true) : [];
    $row['badges'] = !empty($row['badges']) ? json_decode($row['badges'], true) : [];
    
    // Convert string values to proper types
    $row['price'] = (float)$row['price'];
    $row['originalPrice'] = !empty($row['originalPrice']) ? (float)$row['originalPrice'] : null;
    $row['discount'] = !empty($row['discount']) ? (float)$row['discount'] : null;
    $row['rating'] = (float)$row['rating'];
    $row['reviewCount'] = (int)$row['reviewCount'];
    $row['quantity'] = (int)$row['quantity'];
    $row['stock_quantity'] = (int)$row['stock_quantity'];
    
    // Add revenue field (calculated from sales if needed, for now 0)
    $row['revenue'] = 0;
    
    $products[] = $row;
}

// Get total count for pagination
$countQuery = "SELECT COUNT(*) as total FROM products WHERE 1=1";
$countParams = [];
$countTypes = "";

if (!empty($search)) {
    $countQuery .= " AND (name LIKE ? OR description LIKE ?)";
    $countParams[] = "%$search%";
    $countParams[] = "%$search%";
    $countTypes .= "ss";
}

if (!empty($category) && $category !== 'all') {
    $countQuery .= " AND category = ?";
    $countParams[] = $category;
    $countTypes .= "s";
}

if (!empty($status) && $status !== 'all') {
    $countQuery .= " AND status = ?";
    $countParams[] = $status;
    $countTypes .= "s";
}

$countStmt = $conn->prepare($countQuery);
if (!empty($countParams)) {
    $countStmt->bind_param($countTypes, ...$countParams);
}
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalCount = $countResult->fetch_assoc()['total'];

// Send response with pagination
sendSuccess([
    'data' => $products,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => (int)$totalCount,
        'pages' => ceil($totalCount / $limit)
    ]
]);
?>