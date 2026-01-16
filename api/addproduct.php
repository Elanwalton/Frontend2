<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse JSON
$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];

// Validate
$required = ['name','description','category','status','price','quantity'];
foreach ($required as $f) {
    if (!isset($data[$f]) || $data[$f] === '') {
        header('Content-Type: application/json');
        echo json_encode(["success"=>false, "message"=>"Missing field: $f"]);
        exit;
    }
}

$name   = htmlspecialchars(strip_tags($data['name']));
$desc   = htmlspecialchars(strip_tags($data['description']));
$cat    = htmlspecialchars(strip_tags($data['category']));
$status = htmlspecialchars(strip_tags($data['status']));
$price  = floatval($data['price']);
$qty    = intval($data['quantity']);
$main   = $data['main_image_url'];
$thumbs = json_encode($data['thumbnails']);

// Handle optional new columns
$highlights = isset($data['highlights']) ? json_encode($data['highlights']) : null;
$sizes = isset($data['sizes']) ? json_encode($data['sizes']) : null;
$specifications = isset($data['specifications']) ? json_encode($data['specifications']) : null;
$reviews = isset($data['reviews']) ? json_encode($data['reviews']) : null;

// Insert
$stmt = $conn->prepare(
    "INSERT INTO products
     (name,description,category,status,price,quantity,main_image_url,thumbnail_urls,highlights,sizes,specifications,reviews,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?, NOW())"
);
$stmt->bind_param("ssssdissssss", $name,$desc,$cat,$status,$price,$qty,$main,$thumbs,$highlights,$sizes,$specifications,$reviews);
if ($stmt->execute()) {
    header('Content-Type: application/json');
    echo json_encode(["success"=>true, "message"=>"Product added successfully"]);
} else {
    header('Content-Type: application/json');
    echo json_encode(["success"=>false, "message"=>"DB Error: " . $stmt->error]);
}
$stmt->close();
$conn->close();