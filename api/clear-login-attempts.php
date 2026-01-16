<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

$email = $_GET['email'] ?? '';

if (empty($email)) {
    echo "Please provide email: ?email=your@email.com\n";
    exit;
}

// Clear login attempts for this email
$sql = "DELETE FROM login_attempts WHERE identifier = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();

$cleared = $stmt->affected_rows;
echo "Cleared $cleared login attempts for: $email\n";

$stmt->close();
$conn->close();
?>
