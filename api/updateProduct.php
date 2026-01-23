<?php
require_once __DIR__ . '/ApiHelper.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDbConnection();

// Parse JSON input
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Validate required fields
$required = ['id', 'name', 'description', 'category', 'status', 'price', 'quantity'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        echo json_encode([
            'success' => false,
            'message' => "Missing required field: $field"
        ]);
        exit;
    }
}

// Sanitize and prepare data
$id = intval($data['id']);
$name = htmlspecialchars(strip_tags($data['name']));
$description = htmlspecialchars(strip_tags($data['description']));
$category = htmlspecialchars(strip_tags($data['category']));
$status = htmlspecialchars(strip_tags($data['status']));
$price = floatval($data['price']);
$quantity = intval($data['quantity']);
$revenue = floatval($data['revenue'] ?? ($price * $quantity));
$rating = floatval($data['rating'] ?? 0);
$brand = isset($data['brand']) ? htmlspecialchars(strip_tags($data['brand'])) : '';
$main_image = isset($data['main_image_url']) ? $data['main_image_url'] : null;
$thumbnails = isset($data['thumbnails']) ? json_encode($data['thumbnails']) : null;

// Check if product exists
$checkStmt = $conn->prepare("SELECT id FROM products WHERE id = ?");
$checkStmt->bind_param("i", $id);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Product not found'
    ]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Update product
$sql = "UPDATE products SET 
    name = ?,
    description = ?,
    category = ?,
    status = ?,
    price = ?,
    quantity = ?,
    stock_quantity = ?,
    revenue = ?,
    rating = ?";

$params = [$name, $description, $category, $status, $price, $quantity, $quantity, $revenue, $rating];
$types = "ssssdiddd";

// Add optional fields if provided
if ($brand !== '') {
    $sql .= ", brand = ?";
    $params[] = $brand;
    $types .= "s";
}

if ($main_image !== null) {
    $sql .= ", main_image_url = ?";
    $params[] = $main_image;
    $types .= "s";
}

if ($thumbnails !== null) {
    $sql .= ", thumbnail_urls = ?";
    $params[] = $thumbnails;
    $types .= "s";
}

$sql .= ", updated_at = NOW() WHERE id = ?";
$params[] = $id;
$types .= "i";

// Prepare and execute statement
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare statement: ' . $conn->error
    ]);
    $conn->close();
    exit;
}

// Bind parameters dynamically
$bindParams = [$types];
for ($i = 0; $i < count($params); $i++) {
    $bindParams[] = &$params[$i];
}
call_user_func_array([$stmt, 'bind_param'], $bindParams);

// Execute update
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => [
                'id' => $id,
                'name' => $name,
                'price' => $price,
                'quantity' => $quantity
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'No changes made to product'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update product: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
