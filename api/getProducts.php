<?php
require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = ($page - 1) * $limit;

$query = "SELECT id, name, category, price, original_price as originalPrice, discount_percentage as discount, rating, review_count as reviewCount, thumbnail_urls as images, description, highlights, status as inStock, stock_quantity as stockCount, colors, sizes, specifications, reviews, badges FROM products LIMIT ? OFFSET ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $limit, $offset);
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
    $row['inStock'] = $row['inStock'] === 'active' || $row['inStock'] === true;
    $row['stockCount'] = (int)$row['stockCount'];
    
    $products[] = $row;
}

sendSuccess(['data' => $products]);
?>
