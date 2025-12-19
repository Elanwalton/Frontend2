'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Package, Truck, Mail, Phone, MapPin, Download, Share2, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './confirmation.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TransactionData {
  transactionId: string;
  amount: number;
  status: string;
  phone: string;
  timestamp: string;
}

interface CheckoutData {
  customerInfo: {
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  total: number;
  cartItems: any[];
  appliedCoupon: {code: string, discount: number} | null;
  subtotal: number;
  shipping: number;
  discount: number;
}

function ConfirmationPageContent() {
  const router = useRouter();
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const storedTransaction = localStorage.getItem('transactionData');
    const storedCheckout = localStorage.getItem('checkoutData');
    
    if (storedTransaction && storedCheckout) {
      const transaction = JSON.parse(storedTransaction);
      const checkout = JSON.parse(storedCheckout);
      
      setTransactionData(transaction);
      setCheckoutData(checkout);
      
      // Generate order number
      const orderNum = 'SUN' + Date.now().toString().slice(-8);
      setOrderNumber(orderNum);
      
      // Clear cart and checkout data
      localStorage.removeItem('cartItems');
      localStorage.removeItem('checkoutData');
      localStorage.removeItem('transactionData');
    } else {
      router.push('/Cart');
    }
  }, [router]);

  const handleShareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sunleaf Tech Order Confirmation',
          text: `Order #${orderNumber} - KSh ${checkoutData?.total.toLocaleString()}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleDownloadReceipt = () => {
    // Create receipt content
    const receiptContent = `
SUNLEAF TECHNOLOGIES - ORDER RECEIPT
=====================================
Order Number: ${orderNumber}
Transaction ID: ${transactionData?.transactionId}
Date: ${new Date(transactionData?.timestamp || '').toLocaleDateString()}
Payment Method: M-Pesa
Status: Completed

CUSTOMER INFORMATION
===================
Name: ${checkoutData?.customerInfo.name}
Email: ${checkoutData?.customerInfo.email}
Phone: ${checkoutData?.customerInfo.phone}
Address: ${checkoutData?.customerInfo.address}
${checkoutData?.customerInfo.city}, ${checkoutData?.customerInfo.postalCode}

ORDER ITEMS
===========
${checkoutData?.cartItems.map(item => 
  `${item.name} x${item.quantity} - KSh ${(item.price * item.quantity).toLocaleString()}`
).join('\n')}

ORDER SUMMARY
=============
Subtotal: KSh ${checkoutData?.subtotal.toLocaleString()}
Shipping: ${checkoutData?.shipping === 0 ? 'FREE' : `KSh ${checkoutData?.shipping?.toLocaleString()}`}
${checkoutData?.appliedCoupon ? `Discount (${checkoutData.appliedCoupon.discount}%): -KSh ${checkoutData.discount.toLocaleString()}\n` : ''}Total: KSh ${checkoutData?.total.toLocaleString()}

Thank you for choosing Sunleaf Technologies!
    `;

    // Create blob and download
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sunleaf_Order_${orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const breadcrumbItems = [
    { label: 'Shopping Cart', href: '/Cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Payment', href: '/payment' },
    { label: 'Confirmation' }
  ];

  if (!transactionData || !checkoutData) {
    return <LoadingSpinner fullScreen message="Loading confirmation details" />;
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <motion.div 
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.successBadge}>
              <CheckCircle size={32} />
            </div>
            <h1 className={styles.title}>Order Confirmed!</h1>
            <p className={styles.subtitle}>
              Thank you for your purchase. Your order has been successfully processed.
            </p>
          </motion.div>

          <div className={styles.grid}>
            <motion.div 
              className={styles.mainContent}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <h2>Order Details</h2>
                  <div className={styles.orderNumber}>#{orderNumber}</div>
                </div>

                <div className={styles.orderInfo}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}>
                      <Package size={20} />
                    </div>
                    <div className={styles.infoContent}>
                      <h3>Order Status</h3>
                      <p>Processing - Your order is being prepared</p>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}>
                      <Truck size={20} />
                    </div>
                    <div className={styles.infoContent}>
                      <h3>Delivery</h3>
                      <p>Estimated delivery: 3-5 business days</p>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}>
                      <Phone size={20} />
                    </div>
                    <div className={styles.infoContent}>
                      <h3>Payment</h3>
                      <p>M-Pesa payment completed • KSh {transactionData.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <h2>Order Items</h2>
                </div>

                <div className={styles.orderItems}>
                  {checkoutData.cartItems.map((item, index) => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.itemImage}>
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className={styles.itemDetails}>
                        <h4>{item.name}</h4>
                        {item.meta && <p className={styles.itemMeta}>{item.meta}</p>}
                        <p className={styles.itemQuantity}>Quantity: {item.quantity}</p>
                      </div>
                      <div className={styles.itemPrice}>
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <h2>Shipping Information</h2>
                </div>

                <div className={styles.shippingInfo}>
                  <div className={styles.addressBlock}>
                    <div className={styles.addressHeader}>
                      <MapPin size={20} />
                      <h3>Delivery Address</h3>
                    </div>
                    <div className={styles.addressDetails}>
                      <p><strong>{checkoutData.customerInfo.name}</strong></p>
                      <p>{checkoutData.customerInfo.address}</p>
                      <p>{checkoutData.customerInfo.city}</p>
                      <p>{checkoutData.customerInfo.postalCode}</p>
                    </div>
                  </div>

                  <div className={styles.contactInfo}>
                    <div className={styles.contactRow}>
                      <Mail size={16} />
                      <span>{checkoutData.customerInfo.email}</span>
                    </div>
                    <div className={styles.contactRow}>
                      <Phone size={16} />
                      <span>{checkoutData.customerInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.primaryButton} onClick={() => router.push('/')}>
                  <Home size={20} />
                  Continue Shopping
                  <ArrowRight size={20} />
                </button>
                
                <div className={styles.secondaryButtons}>
                  <button className={styles.secondaryButton} onClick={handleDownloadReceipt}>
                    <Download size={20} />
                    Download Receipt
                  </button>
                  
                  <button className={styles.secondaryButton} onClick={handleShareOrder}>
                    <Share2 size={20} />
                    Share Order
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className={styles.sidebar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={styles.summaryCard}>
                <h3>Order Summary</h3>
                
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>KSh {checkoutData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span className={checkoutData.shipping === 0 ? styles.freeShipping : ''}>
                      {checkoutData.shipping === 0 ? 'FREE' : `KSh ${checkoutData.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {checkoutData.appliedCoupon && (
                    <div className={`${styles.summaryRow} ${styles.discount}`}>
                      <span>Discount ({checkoutData.appliedCoupon.discount}%)</span>
                      <span>-KSh {checkoutData.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className={styles.summaryTotal}>
                    <span>Total Paid</span>
                    <span>KSh {checkoutData.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.paymentInfo}>
                  <h4>Payment Information</h4>
                  <div className={styles.paymentDetails}>
                    <div className={styles.paymentRow}>
                      <span>Transaction ID:</span>
                      <span>{transactionData.transactionId}</span>
                    </div>
                    <div className={styles.paymentRow}>
                      <span>Payment Method:</span>
                      <span>M-Pesa</span>
                    </div>
                    <div className={styles.paymentRow}>
                      <span>Phone Number:</span>
                      <span>{transactionData.phone}</span>
                    </div>
                    <div className={styles.paymentRow}>
                      <span>Date:</span>
                      <span>{new Date(transactionData.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.nextSteps}>
                  <h4>What's Next?</h4>
                  <ul>
                    <li>You'll receive an email confirmation shortly</li>
                    <li>We'll process your order within 24 hours</li>
                    <li>You'll get tracking information once shipped</li>
                    <li>Delivery typically takes 3-5 business days</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <ProtectedRoute>
      <ConfirmationPageContent />
    </ProtectedRoute>
  );
}
