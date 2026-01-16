<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

// Get email from request
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

// Validate email
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Check if email already subscribed
$checkSql = "SELECT id FROM newsletter_subscribers WHERE email = ?";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email already subscribed']);
    exit;
}

// Insert new subscriber
$insertSql = "INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())";
$stmt = $conn->prepare($insertSql);
$stmt->bind_param("s", $email);

if ($stmt->execute()) {
    // TODO: Send confirmation email here
    echo json_encode([
        'success' => true,
        'message' => 'Successfully subscribed to our newsletter!'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to subscribe']);
}

?>
