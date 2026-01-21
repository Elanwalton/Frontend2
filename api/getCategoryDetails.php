<?php
require_once __DIR__ . '/ApiHelper.php';

$conn = getDbConnection();

// Get category ID or Slug from query parameter
$categoryId = isset($_GET['id']) ? intval($_GET['id']) : 0;
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$name = isset($_GET['name']) ? trim($_GET['name']) : '';

if ($categoryId <= 0 && empty($slug) && empty($name)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid category criteria'
    ]);
    exit();
}

// Prepare query based on ID, Slug, or Name
$whereClause = "";
$paramType = "";
$paramValue = "";

if ($categoryId > 0) {
    $whereClause = "id = ?";
    $paramType = "i";
    $paramValue = $categoryId;
} elseif (!empty($slug)) {
    $whereClause = "slug = ?";
    $paramType = "s";
    $paramValue = $slug;
} else {
    $whereClause = "name = ?";
    $paramType = "s";
    $paramValue = $name;
}

// Fetch category details
$sql = "SELECT *
FROM categories 
WHERE $whereClause
LIMIT 1";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, $paramType, $paramValue);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$category = mysqli_fetch_assoc($result);
    
if (!$category) {
    echo json_encode([
        'success' => false,
        'message' => 'Category not found'
    ]);
    exit();
}

// Fallback for missing SEO data
if (empty($category['meta_title'])) {
    $category['meta_title'] = $category['name'] . " | Sunleaf Technologies";
}

if (empty($category['meta_description'])) {
    $category['meta_description'] = "Shop for " . $category['name'] . " at Sunleaf Technologies. Best prices in Kenya.";
}

if (empty($category['slug'])) {
    $category['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $category['name']), '-'));
}

// Schema Markup (BreadcrumbList)
$category['schema_markup'] = [
    "@context" => "https://schema.org/",
    "@type" => "BreadcrumbList",
    "itemListElement" => [
        [
            "@type" => "ListItem",
            "position" => 1,
            "name" => "Home",
            "item" => "https://sunleaftechnologies.co.ke/"
        ],
        [
            "@type" => "ListItem",
            "position" => 2,
            "name" => "Shop",
            "item" => "https://sunleaftechnologies.co.ke/categories"
        ],
        [
            "@type" => "ListItem",
            "position" => 3,
            "name" => $category['name'],
            "item" => "https://sunleaftechnologies.co.ke/category/" . $category['slug']
        ]
    ]
];

echo json_encode([
    'success' => true,
    'data' => $category
]);

if (!$category) {
    error_log("Category not found or database error in getCategoryDetails.php");
}
?>
