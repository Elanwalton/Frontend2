import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Eye, 
  Download, 
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  List,
  Layers
} from "lucide-react";
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '@/styles/ClientOrders.module.css';

interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_attributes?: any;
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_date: string;
  shipped_date?: string;
  delivered_date?: string;
  shipping_address?: any;
  billing_address?: any;
  payment_method?: string;
  notes?: string;
  item_count: number;
  items: OrderItem[];
}

const OrdersSection = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  const { isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    // Only fetch orders after auth has completed and user is authenticated
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setError('Please log in to view your orders');
      setLoading(false);
    }
  }, [authLoading, user]);

  const fetchOrders = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(getApiEndpoint('/orders'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Orders: Response status:', response.status);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount === 0) {
        console.log('Orders: Attempting token refresh...');
        try {
          const refreshResponse = await fetch(getApiEndpoint('/auth/refresh'), {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (refreshResponse.ok) {
            console.log('Orders: Token refreshed successfully, retrying...');
            // Wait a bit for cookie to be set
            await new Promise(resolve => setTimeout(resolve, 100));
            // Retry the original request
            return fetchOrders(1);
          } else {
            console.error('Orders: Token refresh failed');
            setError('Your session has expired. Please log in again.');
            setLoading(false);
            return;
          }
        } catch (refreshError) {
          console.error('Orders: Token refresh error:', refreshError);
          setError('Your session has expired. Please log in again.');
          setLoading(false);
          return;
        }
      }
      
      const data = await response.json();
      console.log('Orders: Response data:', data);
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "delivered": return <CheckCircle size={18} />;
      case "shipped": return <Truck size={18} />;
      case "processing": return <Clock size={18} />;
      case "pending": return <Package size={18} />;
      case "cancelled": return <X size={18} />;
      default: return <Package size={18} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case "delivered": return styles.statusDelivered;
      case "shipped": return styles.statusShipped;
      case "processing": return styles.statusProcessing;
      case "pending": return styles.statusPending;
      case "cancelled": return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  const getPaymentStatusClass = (status: string) => {
    switch(status) {
      case "paid": return styles.paymentPaid;
      case "pending": return styles.paymentPending;
      case "failed": return styles.paymentFailed;
      case "refunded": return styles.paymentRefunded;
      default: return styles.paymentPending;
    }
  };

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertCircle size={64} />
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button onClick={() => fetchOrders()} className={styles.retryBtn}>
              Try Again
            </button>
            {error.includes('log in') && (
              <button 
                onClick={() => window.location.href = '/login'} 
                className={styles.loginBtn}
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>My Orders</h2>
          <p>Track and manage your orders</p>
        </div>
        <div className={styles.orderStats}>
          <div className={styles.stat}>
            <Package size={20} />
            <span>{orderStats.total} Orders</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
          title="All Orders"
        >
          <Layers size={18} />
          <span className={styles.tabLabel}>All</span>
          <span className={styles.tabCount}>{orderStats.total}</span>
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
          title="Pending"
        >
          <Clock size={18} />
          <span className={styles.tabLabel}>Pending</span>
          <span className={styles.tabCount}>{orderStats.pending}</span>
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'processing' ? styles.active : ''}`}
          onClick={() => setFilter('processing')}
          title="Processing"
        >
          <Loader2 size={18} />
          <span className={styles.tabLabel}>Processing</span>
          <span className={styles.tabCount}>{orderStats.processing}</span>
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'shipped' ? styles.active : ''}`}
          onClick={() => setFilter('shipped')}
          title="Shipped"
        >
          <Truck size={18} />
          <span className={styles.tabLabel}>Shipped</span>
          <span className={styles.tabCount}>{orderStats.shipped}</span>
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'delivered' ? styles.active : ''}`}
          onClick={() => setFilter('delivered')}
          title="Delivered"
        >
          <CheckCircle size={18} />
          <span className={styles.tabLabel}>Delivered</span>
          <span className={styles.tabCount}>{orderStats.delivered}</span>
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyOrders}>
          <Package size={64} />
          <h3>No orders found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't placed any orders yet. Start shopping to see your orders here."
              : `No ${filter} orders found.`
            }
          </p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              className={styles.orderCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  {order.items.length > 0 && order.items[0].product_image && (
                    <img 
                      src={order.items[0].product_image} 
                      alt="Product" 
                      className={styles.orderImage} 
                    />
                  )}
                  <div>
                    <h3>{order.order_number}</h3>
                    <p className={styles.orderDate}>
                      <Calendar size={14} />
                      {new Date(order.order_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className={styles.orderStatus}>
                  <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                  <div className={`${styles.paymentBadge} ${getPaymentStatusClass(order.payment_status)}`}>
                    <CreditCard size={14} />
                    <span>{order.payment_status}</span>
                  </div>
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Items:</span>
                  <span className={styles.value}>{order.item_count} products</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Total:</span>
                  <span className={styles.value}>{order.currency} {order.total_amount.toLocaleString()}</span>
                </div>
                {order.payment_method && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Payment:</span>
                    <span className={styles.value}>{order.payment_method}</span>
                  </div>
                )}
              </div>

              <div className={styles.orderActions}>
                <button 
                  className={styles.actionBtn}
                  onClick={() => viewOrderDetails(order)}
                >
                  <Eye size={18} />
                  View Details
                </button>
                <button 
                  className={styles.expandBtn}
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  {expandedOrders.has(order.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  {expandedOrders.has(order.id) ? 'Hide' : 'Show'} Items
                </button>
              </div>

              <AnimatePresence>
                {expandedOrders.has(order.id) && (
                  <motion.div
                    className={styles.orderItems}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4>Order Items</h4>
                    {order.items.map((item, itemIndex) => (
                      <div key={item.id} className={styles.orderItem}>
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name} 
                            className={styles.itemImage} 
                          />
                        )}
                        <div className={styles.itemDetails}>
                          <h5>{item.product_name}</h5>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: {order.currency} {item.unit_price.toLocaleString()}</p>
                        </div>
                        <div className={styles.itemTotal}>
                          {order.currency} {item.total_price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className={styles.orderModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOrderDetails}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Order Details</h3>
                <button onClick={closeOrderDetails} className={styles.closeBtn}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.orderSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Order Number:</span>
                    <span className={styles.value}>{selectedOrder.order_number}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Order Date:</span>
                    <span className={styles.value}>
                      {new Date(selectedOrder.order_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Status:</span>
                    <div className={`${styles.statusBadge} ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span>{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Payment Status:</span>
                    <div className={`${styles.paymentBadge} ${getPaymentStatusClass(selectedOrder.payment_status)}`}>
                      <CreditCard size={14} />
                      <span>{selectedOrder.payment_status}</span>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Total Amount:</span>
                    <span className={styles.value}>{selectedOrder.currency} {selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                  {selectedOrder.payment_method && (
                    <div className={styles.summaryItem}>
                      <span className={styles.label}>Payment Method:</span>
                      <span className={styles.value}>{selectedOrder.payment_method}</span>
                    </div>
                  )}
                </div>

                {selectedOrder.shipping_address && (
                  <div className={styles.addressSection}>
                    <h4><MapPin size={16} /> Shipping Address</h4>
                    <div className={styles.addressDetails}>
                      <p>{selectedOrder.shipping_address.address_line1}</p>
                      {selectedOrder.shipping_address.address_line2 && (
                        <p>{selectedOrder.shipping_address.address_line2}</p>
                      )}
                      <p>
                        {selectedOrder.shipping_address.city}
                        {selectedOrder.shipping_address.state && `, ${selectedOrder.shipping_address.state}`}
                        {selectedOrder.shipping_address.postal_code && ` ${selectedOrder.shipping_address.postal_code}`}
                      </p>
                      <p>{selectedOrder.shipping_address.country}</p>
                      {selectedOrder.shipping_address.phone && (
                        <p>Phone: {selectedOrder.shipping_address.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.itemsSection}>
                  <h4>Order Items</h4>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className={styles.modalItem}>
                      {item.product_image && (
                        <img 
                          src={item.product_image} 
                          alt={item.product_name} 
                          className={styles.modalItemImage} 
                        />
                      )}
                      <div className={styles.modalItemDetails}>
                        <h5>{item.product_name}</h5>
                        <p>Quantity: {item.quantity}</p>
                        <p>Unit Price: {selectedOrder.currency} {item.unit_price.toLocaleString()}</p>
                      </div>
                      <div className={styles.modalItemTotal}>
                        {selectedOrder.currency} {item.total_price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedOrder.notes && (
                  <div className={styles.notesSection}>
                    <h4>Order Notes</h4>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button className={styles.actionBtn}>
                    <Download size={18} />
                    Download Invoice
                  </button>
                  {selectedOrder.status === 'delivered' && (
                    <button className={styles.actionBtn}>
                      <Package size={18} />
                      Order Again
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersSection;
