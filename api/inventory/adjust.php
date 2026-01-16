<?php
require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../auth-middleware.php';
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/../NotificationService.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents('php://input'), true);

// Check if this is a batch adjustment
if (isset($input['adjustments']) && is_array($input['adjustments'])) {
    // Batch adjustment processing
    $results = [];
    $conn->begin_transaction();
    
    try {
        foreach ($input['adjustments'] as $adjustment) {
            // Validate required fields for each adjustment
            $required = ['product_id', 'quantity', 'movement_type'];
            foreach ($required as $field) {
                if (!isset($adjustment[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            
            // Validate quantity
            if (!is_numeric($adjustment['quantity']) || $adjustment['quantity'] <= 0) {
                throw new Exception('Quantity must be a positive number');
            }
            
            // Validate movement type
            $validTypes = ['purchase', 'sale', 'return', 'adjustment'];
            if (!in_array($adjustment['movement_type'], $validTypes)) {
                throw new Exception('Invalid movement type');
            }
            
            // Get user ID from session
            session_start();
            $userId = $_SESSION['user_id'] ?? 1;
            
            // Insert stock movement
            $stmt = $conn->prepare("
                INSERT INTO stock_movements 
                (product_id, quantity_change, movement_type, reference_type, reference_id, notes, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $reference_type = $adjustment['reference_type'] ?? '';
            $reference_id = $adjustment['reference_id'] ?? 0;
            $notes = $adjustment['notes'] ?? '';
            
            $stmt->bind_param(
                'iissssi',
                $adjustment['product_id'],
                $adjustment['quantity'],
                $adjustment['movement_type'],
                $reference_type,
                $reference_id,
                $notes,
                $userId
            );
            
            $stmt->execute();
            $movementId = $conn->insert_id;
            
            // Update product quantity
            if ($adjustment['movement_type'] === 'sale') {
                $checkStmt = $conn->prepare("SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE");
                $checkStmt->bind_param('i', $adjustment['product_id']);
                $checkStmt->execute();
                $currentStock = $checkStmt->get_result()->fetch_assoc()['stock_quantity'];
                
                if ($currentStock < $adjustment['quantity']) {
                    throw new Exception('Insufficient stock available');
                }
                
                $sql = "UPDATE products SET stock_quantity = stock_quantity - ?, quantity = quantity - ? WHERE id = ?";
            } else {
                $sql = "UPDATE products SET stock_quantity = stock_quantity + ?, quantity = quantity + ? WHERE id = ?";
            }
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('iii', $adjustment['quantity'], $adjustment['quantity'], $adjustment['product_id']);
            $stmt->execute();
            
            $results[] = [
                'success' => true,
                'movement_id' => $movementId,
                'product_id' => $adjustment['product_id']
            ];
        }
        
        $conn->commit();

        // Broadcast notification to all admins
        try {
            $count = count($results);
            NotificationService::broadcastToAdmins(
                $conn,
                'inventory',
                'Stock adjusted',
                "Processed {$count} stock adjustment" . ($count === 1 ? '' : 's') . '.',
                '/admin-dashboard/inventory/movements'
            );
        } catch (Throwable $e) {
            // Do not fail the primary operation if notifications fail
            error_log('Failed to create stock adjustment notification: ' . $e->getMessage());
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'All adjustments processed successfully',
            'results' => $results
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to process adjustments',
            'details' => $e->getMessage()
        ]);
    }
    exit;
}

// Required fields
$required = ['product_id', 'quantity', 'movement_type'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

// Validate quantity
if (!is_numeric($input['quantity']) || $input['quantity'] <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Quantity must be a positive number']);
    exit;
}

// Validate movement type
$validTypes = ['purchase', 'sale', 'return', 'adjustment'];
if (!in_array($input['movement_type'], $validTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid movement type']);
    exit;
}

// Get user ID from session or token
session_start();
$userId = $_SESSION['user_id'] ?? 1; // Default to admin if not logged in

// Start transaction
$conn->begin_transaction();

try {
    // Insert stock movement
    $stmt = $conn->prepare("
        INSERT INTO stock_movements 
        (product_id, quantity_change, movement_type, reference_type, reference_id, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $reference_type = $input['reference_type'] ?? '';
    $reference_id = $input['reference_id'] ?? 0;
    $notes = $input['notes'] ?? '';
    
    $stmt->bind_param(
        'iissssi',
        $input['product_id'],
        $input['quantity'],
        $input['movement_type'],
        $reference_type,
        $reference_id,
        $notes,
        $userId
    );
    
    $stmt->execute();
    $movementId = $conn->insert_id;
    
    // Update product quantity based on movement type
    if ($input['movement_type'] === 'sale') {
        // For sales, we need to check if enough stock is available
        $checkStmt = $conn->prepare("
            SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE
        ");
        $checkStmt->bind_param('i', $input['product_id']);
        $checkStmt->execute();
        $currentStock = $checkStmt->get_result()->fetch_assoc()['stock_quantity'];
        
        if ($currentStock < $input['quantity']) {
            throw new Exception('Insufficient stock available');
        }
        
        $sql = "UPDATE products 
                SET stock_quantity = stock_quantity - ?, 
                    quantity = quantity - ? 
                WHERE id = ?";
    } else {
        $sql = "UPDATE products 
                SET stock_quantity = stock_quantity + ?, 
                    quantity = quantity + ? 
                WHERE id = ?";
    }
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iii', $input['quantity'], $input['quantity'], $input['product_id']);
    $stmt->execute();
    
    // Get updated product info
    $product = $conn->query("
        SELECT 
            p.*,
            (SELECT COUNT(*) FROM stock_movements WHERE product_id = p.id) as movement_count,
            (p.stock_quantity <= p.reorder_level) as is_low_stock
        FROM products p 
        WHERE p.id = {$input['product_id']}
    ")->fetch_assoc();
    
    // Commit transaction
    $conn->commit();

    // Broadcast notification to all admins
    try {
        NotificationService::broadcastToAdmins(
            $conn,
            'inventory',
            'Stock adjusted',
            'A stock adjustment was processed successfully.',
            '/admin-dashboard/inventory/movements'
        );
    } catch (Throwable $e) {
        // Do not fail the primary operation if notifications fail
        error_log('Failed to create stock adjustment notification: ' . $e->getMessage());
    }
    
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
        'error' => 'Failed to adjust stock',
        'details' => $e->getMessage()
    ]);
}