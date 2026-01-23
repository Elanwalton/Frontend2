'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CreditCard, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Loader2, Shield, Clock, Home, ChevronRight, ShoppingBag, Package } from 'lucide-react';
import { getApiUrl } from '@/utils/apiUrl';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './payment.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_BASE_URL = RAW_API_URL ? RAW_API_URL.replace(/\/?api\/?$/i, '') : '';

const resolveApiUrl = (path: string): string => {
  return getApiUrl(path);
};

interface CheckoutData {
  customerInfo: {
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    userId?: number;
  };
  total: number;
  cartItems: any[];
  appliedCoupon: {code: string, discount: number} | null;
  subtotal: number;
  shipping: number;
  discount: number;
}

function PaymentPageContent() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('checkoutData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setCheckoutData(data);
      setPhoneNumber(data.customerInfo.phone);
    } else {
      router.push('/Cart');
    }
  }, [router]);

  const handleMpesaPayment = async () => {
    if (!phoneNumber.match(/^(07|01)[0-9]{8}$/)) {
      setErrorMessage('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Step 1: Create order first
      const orderResponse = await fetch(getApiUrl('/api/createOrder'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_info: checkoutData?.customerInfo,
          cart_items: checkoutData?.cartItems,
          total_amount: checkoutData?.total,
          payment_method: 'mpesa',
          shipping_address: `${checkoutData?.customerInfo?.address}, ${checkoutData?.customerInfo?.city}`,
          applied_coupon: checkoutData?.appliedCoupon,
          notes: 'Order created awaiting payment confirmation'
        })
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      const orderId = orderResult.data.order_id;
      const orderNumber = orderResult.data.order_number;

      // Step 2: Generate unique transaction ID
      const txId = 'SUN' + Date.now().toString().slice(-8);
      setTransactionId(txId);

      // Step 3: Call M-Pesa STK Push API with order ID
      const response = await fetch(getApiUrl('/api/mpesa/mpesa-stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          amount: checkoutData?.total,
          order_id: orderId,
          user_id: checkoutData?.customerInfo?.userId || 1,
          customer_email: checkoutData?.customerInfo?.email,
          customer_name: checkoutData?.customerInfo?.name
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store order data with transaction info
        localStorage.setItem('orderData', JSON.stringify({
          orderId: orderId,
          orderNumber: orderNumber,
          transactionId: txId,
          amount: checkoutData?.total,
          status: 'pending',
          phone: phoneNumber,
          timestamp: new Date().toISOString()
        }));
        
        // Start polling for payment status
        pollPaymentStatus(txId, orderId);
      } else {
        throw new Error(result.message || 'Payment initiation failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (txId: string, orderId: string) => {
    const maxAttempts = 20; // Poll for up to 2 minutes (6 seconds * 20)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(getApiUrl('/api/mpesa/mpesa-status'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkout_request_id: txId
          })
        });

        const result = await response.json();

        if (result.data && result.data.status === 'success') {
          setPaymentStatus('success');
          setIsProcessing(false);
          
          // Update order data with payment success
          const orderData = JSON.parse(localStorage.getItem('orderData') || '{}');
          orderData.status = 'paid';
          orderData.paymentStatus = 'completed';
          localStorage.setItem('orderData', JSON.stringify(orderData));
          
          // Clear cart
          localStorage.removeItem('checkoutData');
          localStorage.removeItem('cartItems');
          
          // Redirect to confirmation after 2 seconds
          setTimeout(() => {
            router.push('/confirmation');
          }, 2000);
        } else if (result.data && result.data.status === 'failed') {
          setPaymentStatus('error');
          setErrorMessage('Payment failed. Please try again.');
          setIsProcessing(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 6000); // Poll every 6 seconds
        } else {
          setPaymentStatus('error');
          setErrorMessage('Payment timeout. Please check your phone and try again.');
          setIsProcessing(false);
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 6000);
        } else {
          setPaymentStatus('error');
          setErrorMessage('Unable to verify payment status. Please contact support.');
          setIsProcessing(false);
        }
      }
    };

    poll();
  };

  const handleCardPayment = () => {
    // Placeholder for card payment integration
    setErrorMessage('Card payment coming soon. Please use M-Pesa for now.');
  };

  const breadcrumbItems = [
    { label: 'Shopping Cart', href: '/Cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Payment' }
  ];

  if (!checkoutData) {
    return <LoadingSpinner fullScreen message="Loading checkout details" />;
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
            <h1 className={styles.title}>Complete Your Purchase</h1>
            <p className={styles.subtitle}>Choose your preferred payment method and complete your order</p>
            
            <div className={styles.progressBar}>
              <div className={styles.progressStep}>
                <div className={`${styles.stepNumber} ${styles.completed}`}>
                  <CheckCircle size={20} />
                </div>
                <span>Cart</span>
              </div>
              <div className={`${styles.progressLine} ${styles.completed}`}></div>
              <div className={styles.progressStep}>
                <div className={`${styles.stepNumber} ${styles.completed}`}>
                  <CheckCircle size={20} />
                </div>
                <span>Checkout</span>
              </div>
              <div className={`${styles.progressLine} ${styles.completed}`}></div>
              <div className={`${styles.progressStep} ${styles.active}`}>
                <div className={styles.stepNumber}>3</div>
                <span>Payment</span>
              </div>
              <div className={styles.progressLine}></div>
              <div className={styles.progressStep}>
                <div className={styles.stepNumber}>4</div>
                <span>Confirmation</span>
              </div>
            </div>
          </motion.div>

          <div className={styles.content}>
            <motion.div 
              className={styles.mainContent}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.paymentMethods}>
                <div className={styles.paymentTabs}>
                  <button
                    className={`${styles.tabButton} ${paymentMethod === 'mpesa' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('mpesa')}
                  >
                    <Smartphone size={20} />
                    <span>M-Pesa</span>
                  </button>
                  <button
                    className={`${styles.tabButton} ${paymentMethod === 'card' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={20} />
                    <span>Credit/Debit Card</span>
                  </button>
                </div>

                {paymentMethod === 'mpesa' && (
                  <motion.div
                    className={styles.paymentForm}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {paymentStatus === 'idle' && (
                      <div className={styles.mpesaForm}>
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">M-Pesa Phone Number</label>
                          <div className={styles.phoneInput}>
                            <span className={styles.prefix}>+254</span>
                            <input
                              type="tel"
                              id="phone"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder="712345678"
                              maxLength={9}
                            />
                          </div>
                          <p className={styles.helpText}>
                            Enter your M-Pesa registered phone number
                          </p>
                        </div>

                        {errorMessage && paymentStatus === 'idle' && (
                          <motion.div 
                            className={styles.errorAlert}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                          </motion.div>
                        )}

                        <button
                          className={styles.submitBtn}
                          onClick={handleMpesaPayment}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className={styles.spinner} />
                              Processing...
                            </>
                          ) : (
                            <>
                              Pay KSh {checkoutData.total.toLocaleString()}
                              <ArrowRight className={styles.btnIcon} />
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {paymentStatus === 'processing' && (
                      <motion.div 
                        className={styles.processingState}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className={styles.phoneScreen}>
                          <div className={styles.mpesaLogo}>M-PESA</div>
                          <div className={styles.paymentDetails}>
                            <p>Pay</p>
                            <h3>KSh {checkoutData.total.toLocaleString()}</h3>
                            <p>to</p>
                            <h4>Sunleaf Tech</h4>
                            <div className={styles.transactionId}>TXN: {transactionId}</div>
                          </div>
                        </div>
                        <div className={styles.processingText}>
                          <h3>Processing Payment...</h3>
                          <p>Please check your phone and enter your M-Pesa PIN</p>
                          <div className={styles.steps}>
                            <div className={styles.step}>
                              <Clock size={16} />
                              <span>Waiting for your confirmation</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentStatus === 'success' && (
                      <motion.div 
                        className={styles.successState}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <CheckCircle className={styles.successIcon} size={64} />
                        <h3>Payment Successful!</h3>
                        <p>Redirecting to confirmation page...</p>
                      </motion.div>
                    )}

                    {paymentStatus === 'error' && (
                      <motion.div 
                        className={styles.errorState}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <AlertCircle className={styles.errorIcon} size={48} />
                        <h3>Payment Failed</h3>
                        <p>{errorMessage}</p>
                        <button
                          className={styles.submitBtn}
                          onClick={() => {
                            setPaymentStatus('idle');
                            setErrorMessage('');
                          }}
                        >
                          Try Again
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {paymentMethod === 'card' && (
                  <motion.div 
                    className={styles.paymentForm}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className={styles.comingSoon}>
                      <CreditCard size={48} />
                      <h3>Card Payment Coming Soon</h3>
                      <p>We're working on integrating secure card payments. For now, please use M-Pesa.</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <button 
                onClick={() => router.back()} 
                className={styles.backBtn}
              >
                <ArrowLeft size={18} />
                Back to Checkout
              </button>
            </motion.div>

            <motion.div 
              className={styles.sidebar}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={styles.orderSummary}>
                <div className={styles.summaryHeader}>
                  <Package className={styles.packageIcon} />
                  <h3>Order Summary</h3>
                </div>
                
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
                    <span>Total Amount</span>
                    <span>KSh {checkoutData.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.customerInfo}>
                  <h4>Billing Information</h4>
                  <div className={styles.infoRow}>
                    <span>Name:</span>
                    <span>{checkoutData.customerInfo.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Email:</span>
                    <span>{checkoutData.customerInfo.email}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Phone:</span>
                    <span>{checkoutData.customerInfo.phone}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Address:</span>
                    <span>{checkoutData.customerInfo.address}, {checkoutData.customerInfo.city}</span>
                  </div>
                </div>

                <div className={styles.securityBadge}>
                  <Shield size={16} />
                  <span>Secure Payment</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentPageContent />
    </ProtectedRoute>
  );
}
