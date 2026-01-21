-- Add performance indexes for admin dashboard queries
-- These indexes will significantly speed up dashboard metrics and order queries

-- Index for date range + status filtering (used in getDashboardMetrics.php)
CREATE INDEX IF NOT EXISTS idx_orders_created_status ON orders(created_at, status);

-- Index for status filtering (used in getOrders.php)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for order items JOIN optimization
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);

-- Index for low stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- Index for product analytics event queries
CREATE INDEX IF NOT EXISTS idx_analytics_date_type ON product_analytics(event_date, event_type);

-- Index for order number lookups (used in order details)
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
