<?php
require_once __DIR__ . '/ApiHelper.php';

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod !== 'POST') {
    header('Allow: POST');
    sendError(405, 'Method not allowed');
}

$conn = getDbConnection();
$data = getJsonInput();

$firstName = trim($data['firstName'] ?? '');
$lastName = trim($data['lastName'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$message = trim($data['message'] ?? '');

$errors = [];

if (empty($firstName)) {
    $errors[] = 'First name is required';
}
if (empty($lastName)) {
    $errors[] = 'Last name is required';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email address is required';
}
if (empty($message)) {
    $errors[] = 'Message is required';
}

if (!empty($errors)) {
    sendError(400, implode('. ', $errors));
}

$sql = "INSERT INTO contact_messages (first_name, last_name, email, phone, message) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    error_log("Prepare failed in contact.php: " . $conn->error);
    sendError(500, 'Internal server error');
}

$stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $message);

if ($stmt->execute()) {
    // Send email notification to admin
    require_once __DIR__ . '/send-mail-smtp.php';
    $fullName = $firstName . ' ' . $lastName;
    
    // Attempt to send email, but don't fail the request if it fails (just log it)
    $emailSent = sendContactFormEmailSMTP($fullName, $email, $phone, $message);
    if (!$emailSent) {
        error_log("Failed to send contact form email for: $email");
    }

    sendSuccess(['message' => 'Thank you! Your message has been sent successfully. We will get back to you shortly.']);
} else {
    error_log("Execute failed in contact.php: " . $stmt->error);
    sendError(500, 'Failed to save your message. Please try again later.');
}
?>
