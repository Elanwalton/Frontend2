<?php
require_once __DIR__ . '/ApiHelper.php';

if (function_exists('getDbConnection')) {
    echo json_encode(['status' => 'success', 'message' => 'getDbConnection function exists']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'getDbConnection function NOT found']);
}
?>
