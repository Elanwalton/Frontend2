<?php
require_once __DIR__ . '/ApiHelper.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if (!$id) {
    sendError(400, 'Product ID is required');
}

$conn = getDbConnection();

$query = "SELECT id, name, category, price, original_price as originalPrice, discount_percentage as discount, rating, review_count as reviewCount, thumbnail_urls as images, description, highlights, status as inStock, stock_quantity as stockCount, colors, sizes, specifications, reviews, badges FROM products WHERE id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendError(404, 'Product not found');
}

$product = $result->fetch_assoc();
$product['images'] = !empty($product['images']) ? json_decode($product['images'], true) : [];
$product['highlights'] = !empty($product['highlights']) ? json_decode($product['highlights'], true) : [];
$product['colors'] = !empty($product['colors']) ? json_decode($product['colors'], true) : [];
$product['sizes'] = !empty($product['sizes']) ? json_decode($product['sizes'], true) : [];
$product['specifications'] = !empty($product['specifications']) ? json_decode($product['specifications'], true) : [];
$product['reviews'] = !empty($product['reviews']) ? json_decode($product['reviews'], true) : [];
$product['badges'] = !empty($product['badges']) ? json_decode($product['badges'], true) : [];

// Convert string values to proper types
$product['price'] = (float)$product['price'];
$product['originalPrice'] = !empty($product['originalPrice']) ? (float)$product['originalPrice'] : null;
$product['discount'] = !empty($product['discount']) ? (float)$product['discount'] : null;
$product['rating'] = (float)$product['rating'];
$product['reviewCount'] = (int)$product['reviewCount'];
$product['stockCount'] = (int)$product['stockCount'];
$statusRaw = $product['inStock'];
$statusStr = is_null($statusRaw) ? '' : strtolower(trim((string)$statusRaw));
$inStockByStatus = in_array($statusStr, ['active', 'in_stock', 'available', '1', 'true', 'yes'], true) || (is_numeric($statusRaw) && (int)$statusRaw > 0);
$product['inStock'] = (bool)($inStockByStatus || $product['stockCount'] > 0);

sendSuccess(['data' => $product]);
?>