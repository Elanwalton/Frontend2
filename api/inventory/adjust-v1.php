<?php
// api/inventory/adjust-v1.php - Production-ready stock adjustment endpoint
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

// Apply rate limiting (stricter for write operations)
rateLimit(30, 60); // 30 adjustments per minute

// Require authentication
requireAuth();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON input', 400);
    }
    
    // Check if this is a batch adjustment
    $isBatch = isset($input['adjustments']) && is_array($input['adjustments']);
    
    if ($isBatch) {
        // Batch adjustment processing (max 10 items per batch)
        if (count($input['adjustments']) > 10) {
            sendError('Maximum 10 adjustments allowed per batch', 400);
        }
        
        processBatchAdjustment($input['adjustments']);
    } else {
        // Single adjustment processing
        processSingleAdjustment($input);
    }
    
} catch (Exception $e) {
    logError('Stock adjustment failed', ['error' => $e->getMessage(), 'input' => $input]);
    sendError('Stock adjustment failed', 500, $isProduction ? null : $e->getMessage());
}

function processSingleAdjustment($input) {
    global $conn;
    
    // Validate input
    $validationRules = [
        'product_id' => ['required' => true, 'type' => FILTER_VALIDATE_INT],
        'quantity' => ['required' => true, 'type' => FILTER_VALIDATE_INT, 'min' => 1],
        'movement_type' => ['required' => true, 'max' => 20],
        'notes' => ['max' => 500]
    ];
    
    $errors = validateInput($input, $validationRules);
    if (!empty($errors)) {
        sendError('Validation failed', 400, $errors);
    }
    
    // Validate movement type
    $validTypes = ['purchase', 'sale', 'return', 'adjustment'];
    if (!in_array($input['movement_type'], $validTypes)) {
        sendError('Invalid movement type', 400);
    }
    
    // Check if product exists and get current stock
    $productStmt = $conn->prepare("SELECT id, name, stock_quantity, reorder_level FROM products WHERE id = ? AND is_active = 1 FOR UPDATE");
    $productStmt->bind_param('i', $input['product_id']);
    $productStmt->execute();
    $product = $productStmt->get_result()->fetch_assoc();
    
    if (!$product) {
        sendError('Product not found', 404);
    }
    
    // Check sufficient stock for sales
    if ($input['movement_type'] === 'sale' && $product['stock_quantity'] < $input['quantity']) {
        sendError('Insufficient stock available', 400);
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert stock movement
        $movementStmt = $conn->prepare("
            INSERT INTO stock_movements 
            (product_id, quantity_change, movement_type, reference_type, reference_id, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $userId = $_SESSION['user_id'];
        $movementStmt->bind_param(
            'iissssi',
            $input['product_id'],
            $input['quantity'],
            $input['movement_type'],
            $input['reference_type'] ?? null,
            $input['reference_id'] ?? null,
            $input['notes'] ?? '',
            $userId
        );
        
        $movementStmt->execute();
        $movementId = $conn->insert_id;
        
        // Update product quantity
        if ($input['movement_type'] === 'sale') {
            $sql = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?";
        } else {
            $sql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
        }
        
        $updateStmt = $conn->prepare($sql);
        $updateStmt->bind_param('ii', $input['quantity'], $input['product_id']);
        $updateStmt->execute();
        
        // Get updated product info
        $updatedProduct = $conn->query("
            SELECT 
                p.*,
                (p.stock_quantity <= p.reorder_level) as is_low_stock,
                (SELECT COUNT(*) FROM stock_movements WHERE product_id = p.id) as movement_count
            FROM products p 
            WHERE p.id = {$input['product_id']}
        ")->fetch_assoc();
        
        $conn->commit();
        
        sendSuccess([
            'movement_id' => $movementId,
            'product' => [
                'id' => (int)$updatedProduct['id'],
                'name' => htmlspecialchars($updatedProduct['name']),
                'stock_quantity' => (int)$updatedProduct['stock_quantity'],
                'is_low_stock' => (bool)$updatedProduct['is_low_stock'],
                'movement_count' => (int)$updatedProduct['movement_count']
            ]
        ], 'Stock adjusted successfully');
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

function processBatchAdjustment($adjustments) {
    global $conn;
    
    $results = [];
    $conn->begin_transaction();
    
    try {
        foreach ($adjustments as $index => $adjustment) {
            // Validate each adjustment
            $validationRules = [
                'product_id' => ['required' => true, 'type' => FILTER_VALIDATE_INT],
                'quantity' => ['required' => true, 'type' => FILTER_VALIDATE_INT, 'min' => 1],
                'movement_type' => ['required' => true, 'max' => 20],
                'notes' => ['max' => 500]
            ];
            
            $errors = validateInput($adjustment, $validationRules);
            if (!empty($errors)) {
                throw new Exception("Validation failed for adjustment #$index: " . implode(', ', $errors));
            }
            
            // Validate movement type
            $validTypes = ['purchase', 'sale', 'return', 'adjustment'];
            if (!in_array($adjustment['movement_type'], $validTypes)) {
                throw new Exception("Invalid movement type for adjustment #$index");
            }
            
            // Check product and stock
            $productStmt = $conn->prepare("SELECT id, name, stock_quantity FROM products WHERE id = ? AND is_active = 1 FOR UPDATE");
            $productStmt->bind_param('i', $adjustment['product_id']);
            $productStmt->execute();
            $product = $productStmt->get_result()->fetch_assoc();
            
            if (!$product) {
                throw new Exception("Product not found for adjustment #$index");
            }
            
            if ($adjustment['movement_type'] === 'sale' && $product['stock_quantity'] < $adjustment['quantity']) {
                throw new Exception("Insufficient stock for product #$adjustment[product_id] in adjustment #$index");
            }
            
            // Insert movement
            $movementStmt = $conn->prepare("
                INSERT INTO stock_movements 
                (product_id, quantity_change, movement_type, reference_type, reference_id, notes, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $userId = $_SESSION['user_id'];
            $movementStmt->bind_param(
                'iissssi',
                $adjustment['product_id'],
                $adjustment['quantity'],
                $adjustment['movement_type'],
                $adjustment['reference_type'] ?? null,
                $adjustment['reference_id'] ?? null,
                $adjustment['notes'] ?? '',
                $userId
            );
            
            $movementStmt->execute();
            $movementId = $conn->insert_id;
            
            // Update product quantity
            if ($adjustment['movement_type'] === 'sale') {
                $sql = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?";
            } else {
                $sql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
            }
            
            $updateStmt = $conn->prepare($sql);
            $updateStmt->bind_param('ii', $adjustment['quantity'], $adjustment['product_id']);
            $updateStmt->execute();
            
            $results[] = [
                'index' => $index,
                'movement_id' => $movementId,
                'product_id' => $adjustment['product_id'],
                'success' => true
            ];
        }
        
        $conn->commit();
        
        sendSuccess([
            'processed' => count($results),
            'results' => $results
        ], 'Batch adjustment processed successfully');
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}
?>
