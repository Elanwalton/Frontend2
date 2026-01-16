<?php
require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth-middleware.php';
// Check authentication (auth-middleware handles CORS and validation)
$auth = $GLOBALS['_AUTH_USER'] ?? null;
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Ensure only POST is allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}
$uploadDir = __DIR__ . '/../images/products/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$urls = [];
// Main image
if (isset($_FILES['main_image']) && $_FILES['main_image']['error'] === UPLOAD_ERR_OK) {
    $name = uniqid() . '_' . basename($_FILES['main_image']['name']);
    move_uploaded_file($_FILES['main_image']['tmp_name'], $uploadDir . $name);
    $urls[] = "products/{$name}";
}
// Thumbnails
if (isset($_FILES['thumbnails'])) {
    foreach ($_FILES['thumbnails']['tmp_name'] as $i => $tmp) {
        if ($_FILES['thumbnails']['error'][$i] === UPLOAD_ERR_OK) {
            $n = uniqid() . '_' . basename($_FILES['thumbnails']['name'][$i]);
            move_uploaded_file($tmp, $uploadDir . $n);
            $urls[] = "products/{$n}";
        }
    }
}
echo json_encode(["success" => true, "urls" => $urls]);