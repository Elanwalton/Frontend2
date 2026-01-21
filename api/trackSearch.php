<?php
require_once __DIR__ . '/ApiHelper.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method Not Allowed');
}

$data = getJsonInput();
$keyword = $data['keyword'] ?? null;
$resultCount = $data['result_count'] ?? 0;

if (!$keyword) {
    sendError(400, 'Keyword is required');
}

$normalized = strtolower(trim($keyword));

try {
    $conn = getDbConnection();
    
    // UPSERT: Insert or update if exists
    $sql = "INSERT INTO search_keywords (keyword, normalized_keyword, search_count, result_count, last_searched) 
            VALUES (?, ?, 1, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                search_count = search_count + 1,
                result_count = ?,
                last_searched = NOW()";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssii", $keyword, $normalized, $resultCount, $resultCount);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to track search: " . $stmt->error);
    }
    
    sendSuccess(['message' => 'Search tracked successfully']);

} catch (Exception $e) {
    error_log("Track Search Error: " . $e->getMessage());
    sendError(500, 'Internal Server Error');
}
?>
