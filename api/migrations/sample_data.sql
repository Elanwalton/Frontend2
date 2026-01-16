-- ============================================================
-- SUNLEAF TECHNOLOGIES - SAMPLE DATA FOR TESTING
-- Populate database with realistic test data
-- ============================================================

USE `sunleaftechnologies`;

-- ============================================================
-- SAMPLE ORDERS
-- ============================================================
INSERT INTO `orders` (`order_number`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `subtotal`, `tax`, `shipping_cost`, `total_amount`, `status`, `payment_status`, `payment_method`, `tracking_number`, `carrier`, `estimated_delivery`, `created_at`) VALUES
('ORD-2024-001', 1, 'John Doe', 'john@example.com', '+1234567890', '123 Main St, City, State 12345', 450.00, 36.00, 15.00, 501.00, 'pending', 'paid', 'Card', NULL, NULL, '2024-11-15', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD-2024-002', 2, 'Jane Smith', 'jane@example.com', '+1234567891', '456 Oak Ave, Town, State 67890', 1250.00, 100.00, 25.00, 1375.00, 'processing', 'paid', 'PayPal', NULL, NULL, '2024-11-16', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ORD-2024-003', NULL, 'Bob Johnson', 'bob@example.com', '+1234567892', '789 Pine Rd, Village, State 11111', 850.00, 68.00, 20.00, 938.00, 'shipped', 'paid', 'Mpesa', 'TRK123456', 'FedEx', '2024-11-12', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD-2024-004', 1, 'Alice Williams', 'alice@example.com', '+1234567893', '321 Elm St, City, State 22222', 2100.00, 168.00, 30.00, 2298.00, 'completed', 'paid', 'Card', 'TRK789012', 'UPS', '2024-11-05', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('ORD-2024-005', NULL, 'Charlie Brown', 'charlie@example.com', '+1234567894', '654 Maple Dr, Town, State 33333', 675.00, 54.00, 18.00, 747.00, 'delivered', 'paid', 'Bank Transfer', 'TRK345678', 'DHL', '2024-11-01', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('ORD-2024-006', 2, 'Diana Prince', 'diana@example.com', '+1234567895', '987 Cedar Ln, Village, State 44444', 1500.00, 120.00, 25.00, 1645.00, 'cancelled', 'refunded', 'PayPal', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 7 DAY)),
('ORD-2024-007', NULL, 'Eve Anderson', 'eve@example.com', '+1234567896', '147 Birch Ct, City, State 55555', 3200.00, 256.00, 35.00, 3491.00, 'shipped', 'paid', 'Card', 'TRK901234', 'FedEx', '2024-11-14', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('ORD-2024-008', 1, 'Frank Miller', 'frank@example.com', '+1234567897', '258 Spruce Way, Town, State 66666', 425.00, 34.00, 12.00, 471.00, 'pending', 'pending', 'Cash on Delivery', NULL, NULL, '2024-11-17', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ============================================================
-- SAMPLE ORDER ITEMS
-- ============================================================
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 'Solar Panel 400W', 2, 225.00, 450.00),
(2, 2, 'LiFePO4 Battery 5kWh', 1, 1250.00, 1250.00),
(3, 3, 'Inverter 5kW Hybrid', 1, 850.00, 850.00),
(4, 1, 'Solar Panel 400W', 4, 225.00, 900.00),
(4, 4, 'Charge Controller 60A', 2, 600.00, 1200.00),
(5, 5, 'Solar Mounting Kit', 3, 225.00, 675.00),
(7, 2, 'LiFePO4 Battery 5kWh', 2, 1250.00, 2500.00),
(7, 6, 'Solar Cable 10mm 100m', 1, 700.00, 700.00),
(8, 1, 'Solar Panel 400W', 1, 225.00, 225.00),
(8, 7, 'MC4 Connectors Pack', 2, 100.00, 200.00);

-- ============================================================
-- SAMPLE PAYMENTS
-- ============================================================
INSERT INTO `payments` (`transaction_id`, `order_id`, `user_id`, `amount`, `currency`, `payment_method`, `status`, `customer_email`, `customer_name`, `processed_at`, `created_at`) VALUES
('TXN-MP-001', 1, 1, 501.00, 'USD', 'Card', 'success', 'john@example.com', 'John Doe', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('TXN-PP-002', 2, 2, 1375.00, 'USD', 'PayPal', 'success', 'jane@example.com', 'Jane Smith', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('TXN-MP-003', 3, NULL, 938.00, 'USD', 'Mpesa', 'success', 'bob@example.com', 'Bob Johnson', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('TXN-CC-004', 4, 1, 2298.00, 'USD', 'Card', 'success', 'alice@example.com', 'Alice Williams', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('TXN-BT-005', 5, NULL, 747.00, 'USD', 'Bank Transfer', 'success', 'charlie@example.com', 'Charlie Brown', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('TXN-PP-006', 6, 2, 1645.00, 'USD', 'PayPal', 'refunded', 'diana@example.com', 'Diana Prince', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('TXN-CC-007', 7, NULL, 3491.00, 'USD', 'Card', 'success', 'eve@example.com', 'Eve Anderson', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('TXN-COD-008', 8, 1, 471.00, 'USD', 'Cash on Delivery', 'pending', 'frank@example.com', 'Frank Miller', NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ============================================================
-- SAMPLE REVIEWS
-- ============================================================
INSERT INTO `reviews` (`product_id`, `user_id`, `customer_name`, `customer_email`, `rating`, `title`, `comment`, `status`, `verified_purchase`, `helpful_count`, `created_at`) VALUES
(1, 1, 'John Doe', 'john@example.com', 5.00, 'Excellent product!', 'Works great and easy to install. Highly recommend!', 'approved', 1, 12, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 'Jane Smith', 'jane@example.com', 4.00, 'Good battery', 'Good battery, but shipping took longer than expected.', 'approved', 1, 8, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, NULL, 'Bob Johnson', 'bob@example.com', 5.00, 'Amazing quality', 'Best solar panels I have purchased. Very efficient.', 'pending', 1, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 1, 'Alice Williams', 'alice@example.com', 4.50, 'Great inverter', 'Works perfectly with my solar setup. Good value.', 'approved', 1, 15, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(4, NULL, 'Charlie Brown', 'charlie@example.com', 3.50, 'Decent controller', 'Does the job but instructions could be better.', 'approved', 0, 3, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1, 2, 'Diana Prince', 'diana@example.com', 2.00, 'Disappointed', 'One panel arrived damaged. Customer service was helpful though.', 'pending', 1, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- ============================================================
-- SAMPLE RETURNS
-- ============================================================
INSERT INTO `returns` (`return_number`, `order_id`, `user_id`, `reason`, `description`, `refund_amount`, `status`, `refund_status`, `created_at`) VALUES
('RET-2024-001', 6, 2, 'Changed mind', 'Customer decided not to proceed with installation', 1645.00, 'completed', 'completed', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('RET-2024-002', 4, 1, 'Defective item', 'One charge controller not working properly', 600.00, 'processing', 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('RET-2024-003', 5, NULL, 'Wrong item received', 'Received wrong mounting kit size', 225.00, 'pending', 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================
-- SAMPLE QUOTE REQUESTS
-- ============================================================
INSERT INTO `quote_requests` (`quote_number`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `company_name`, `description`, `estimated_value`, `status`, `valid_until`, `created_at`) VALUES
('QT-2024-001', NULL, 'ABC Corporation', 'contact@abc.com', '+1234567800', 'ABC Corp', 'Solar installation for warehouse - 100kW system', 50000.00, 'sent', '2024-12-31', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('QT-2024-002', 1, 'XYZ Industries', 'info@xyz.com', '+1234567801', 'XYZ Industries', 'Off-grid solar system for remote facility', 75000.00, 'accepted', '2024-11-30', DATE_SUB(NOW(), INTERVAL 20 DAY)),
('QT-2024-003', NULL, 'Green Energy LLC', 'sales@greenenergy.com', '+1234567802', 'Green Energy LLC', 'Solar panels for residential development', 120000.00, 'processing', '2025-01-15', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('QT-2024-004', 2, 'Solar Solutions Inc', 'quotes@solarsolutions.com', '+1234567803', 'Solar Solutions Inc', 'Battery storage system upgrade', 35000.00, 'pending', '2024-12-15', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('QT-2024-005', NULL, 'EcoTech Partners', 'info@ecotech.com', '+1234567804', 'EcoTech Partners', 'Commercial solar installation', 95000.00, 'rejected', '2024-11-20', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ============================================================
-- SAMPLE NOTIFICATIONS
-- ============================================================
INSERT INTO `notifications` (`user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES
(1, 'order', 'New Order Received', 'Order ORD-2024-008 has been placed', '/admin-dashboard/orders/pending', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'review', 'New Review Pending', 'A new review is waiting for approval', '/admin-dashboard/reviews', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'low_stock', 'Low Stock Alert', 'Solar Panel 400W is running low on stock', '/admin-dashboard/products/allProducts', 1, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(1, 'quote', 'New Quote Request', 'Quote request QT-2024-004 received', '/admin-dashboard/quote', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'return', 'Return Request', 'Return request RET-2024-003 needs processing', '/admin-dashboard/orders/returns', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================
-- SAMPLE DASHBOARD METRICS (Last 7 days)
-- ============================================================
INSERT INTO `dashboard_metrics` (`metric_date`, `total_revenue`, `total_orders`, `completed_orders`, `pending_orders`, `shipped_orders`, `new_customers`, `total_products_sold`, `avg_order_value`, `conversion_rate`) VALUES
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), 2500.00, 12, 8, 2, 2, 3, 45, 208.33, 3.2),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 3200.00, 15, 10, 3, 2, 4, 52, 213.33, 3.5),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), 2800.00, 13, 9, 2, 2, 2, 48, 215.38, 3.1),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 4100.00, 18, 12, 4, 2, 5, 65, 227.78, 3.8),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 3500.00, 16, 11, 3, 2, 3, 58, 218.75, 3.4),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2900.00, 14, 9, 3, 2, 4, 51, 207.14, 3.3),
(CURDATE(), 1800.00, 8, 5, 2, 1, 2, 28, 225.00, 3.0);

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Sample data inserted successfully!' AS Status;
SELECT 
  'orders' AS table_name, COUNT(*) AS row_count FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'returns', COUNT(*) FROM returns
UNION ALL
SELECT 'quote_requests', COUNT(*) FROM quote_requests
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'dashboard_metrics', COUNT(*) FROM dashboard_metrics;
