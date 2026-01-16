<?php
$local = ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.') === 0);
session_set_cookie_params([
    'lifetime' => 86400,
    'path'     => '/',
    'secure'   => !$local,
    'httponly' => true,
    'samesite' => $local ? 'Lax' : 'None'
]);
session_start();
error_log('SESSION → ' . json_encode($_SESSION, JSON_PRETTY_PRINT));


require_once 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

/* ───── Auth guard ───── */
if (!isset($_SESSION['logged_in']) || $_SESSION['role'] !== 'admin') {
  http_response_code(401);
  echo json_encode(['authenticated' => false, 'message' => 'Unauthorized']);
  exit;
}

/* ───── DB query ───── */
require_once "connection.php";

$sql = "
  SELECT id,
         CONCAT(first_name, ' ', second_name) AS name,
         email,
         phone,
         role,
         status,
         created_at
  FROM   users
  ORDER  BY id DESC
";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = [
        'id'     => (int) $row['id'],
        'name'   => $row['name'],          // now exists
        'email'  => $row['email'],
        'phone'  => $row['phone'],
        'role'   => $row['role'],
        'status' => $row['status'],
        'joined' => $row['created_at'],
    ];
}

echo json_encode(['authenticated' => true, 'users' => $rows]);

$stmt->close();
$conn->close();
