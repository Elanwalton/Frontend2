// api/inventory/index.php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';

$auth = $GLOBALS['_AUTH_USER'] ?? null;
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];

// Check for endpoint in query parameter first, then PATH_INFO
$endpoint = $_GET['endpoint'] ?? '';
if (empty($endpoint)) {
    $request = isset($_SERVER['PATH_INFO']) ? trim($_SERVER['PATH_INFO'], '/') : '';
    $path = explode('/', $request);
    $endpoint = $path[0] ?? '';
}

switch ("$method:$endpoint") {
    case 'GET:stock-levels':
        getStockLevels();
        break;
    case 'GET:movements':
        $productId = $_GET['product_id'] ?? null;
        if ($productId) {
            getProductMovements((int)$productId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
        }
        break;
    case 'POST:adjust':
        adjustStock();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        break;
}

function getStockLevels() {
    global $conn;
    
    $sql = "SELECT 
                p.id, 
                p.name, 
                p.sku, 
                p.stock_quantity as current_quantity,
                p.reorder_level,
                p.price,
                (p.price * p.stock_quantity) as inventory_value,
                COALESCE(SUM(CASE 
                    WHEN sm.movement_type = 'purchase' OR sm.movement_type = 'return' 
                    THEN sm.quantity_change 
                    ELSE 0 
                END), 0) as total_purchased,
                COALESCE(SUM(CASE 
                    WHEN sm.movement_type = 'sale' 
                    THEN sm.quantity_change 
                    ELSE 0 
                END), 0) as total_sold,
                p.stock_quantity <= p.reorder_level as is_low_stock,
                c.name as category_name
            FROM 
                products p
            LEFT JOIN 
                stock_movements sm ON p.id = sm.product_id
            LEFT JOIN
                categories c ON p.category_id = c.id
            GROUP BY 
                p.id
            ORDER BY 
                is_low_stock DESC, 
                p.stock_quantity ASC";
            
    $result = $conn->query($sql);
    $inventory = [];
    
    while ($row = $result->fetch_assoc()) {
        $inventory[] = $row;
    }
    
    echo json_encode($inventory);
}

function getProductMovements($productId) {
    global $conn;
    
    $sql = "SELECT 
                sm.*, 
                u.username as created_by_name,
                p.name as product_name
            FROM 
                stock_movements sm
            LEFT JOIN 
                users u ON sm.created_by = u.id
            LEFT JOIN
                products p ON sm.product_id = p.id
            WHERE 
                sm.product_id = ?
            ORDER BY 
                sm.created_at DESC
            LIMIT 100";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $movements = [];
    while ($row = $result->fetch_assoc()) {
        // Format the movement type for display
        $row['movement_type_display'] = ucfirst($row['movement_type']);
        $row['created_at_formatted'] = date('M d, Y H:i', strtotime($row['created_at']));
        $movements[] = $row;
    }
    
    echo json_encode($movements);
}

function adjustStock() {
    global $conn;
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['product_id', 'quantity', 'movement_type'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            return;
        }
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert stock movement
        $stmt = $conn->prepare("
            INSERT INTO stock_movements 
            (product_id, quantity_change, movement_type, reference_type, reference_id, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->bind_param(
            'iissssi',
            $input['product_id'],
            $input['quantity'],
            $input['movement_type'],
            $input['reference_type'] ?? null,
            $input['reference_id'] ?? null,
            $input['notes'] ?? '',
            $input['user_id'] ?? 1 // Default to admin user
        );
        
        $stmt->execute();
        $movementId = $conn->insert_id;
        
        // Update product quantity based on movement type
        if ($input['movement_type'] === 'sale') {
            $sql = "UPDATE products 
                    SET stock_quantity = GREATEST(0, stock_quantity - ?) 
                    WHERE id = ?";
        } else {
            $sql = "UPDATE products 
                    SET stock_quantity = stock_quantity + ? 
                    WHERE id = ?";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $input['quantity'], $input['product_id']);
        $stmt->execute();
        
        // Check for low stock after update
        $product = $conn->query("
            SELECT 
                p.*,
                (p.stock_quantity <= p.reorder_level) as is_low_stock
            FROM products p 
            WHERE p.id = {$input['product_id']}
        ")->fetch_assoc();
        
        // Commit transaction
        $conn->commit();
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Stock updated successfully',
            'movement_id' => $movementId,
            'product' => $product
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to update stock',
            'details' => $e->getMessage()
        ]);
    }
}