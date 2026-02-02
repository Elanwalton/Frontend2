'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Tag, ArrowRight, ShoppingBag, Shield, Truck, Check, AlertCircle, X, Package, Loader2 } from 'lucide-react';
import useCartStore from '@/store/UseCartStore';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './checkout.module.css';

function CheckoutPageContent() {
  const router = useRouter();
  const { cartItems, clearCart } = useCartStore();
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showCouponHelp, setShowCouponHelp] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/Cart');
    }
  }, [cartItems, router]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;
  const total = subtotal - discount;

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!/^(07|01)[0-9]{8}$/.test(value)) {
          newErrors.phone = 'Enter a valid Kenyan phone number (e.g., 0712345678)';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'name':
        if (value.length < 3) {
          newErrors.name = 'Name must be at least 3 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'address':
        if (value.length < 5) {
          newErrors.address = 'Please enter a complete address';
        } else {
          delete newErrors.address;
        }
        break;
      case 'city':
        if (value.length < 2) {
          newErrors.city = 'Please enter a valid city';
        } else {
          delete newErrors.city;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo({ ...customerInfo, [field]: value });
    if (value) {
      validateField(field, value);
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase();
    if (code === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 10 });
      setCouponCode('');
    } else if (code === 'SUNLEAF20') {
      setAppliedCoupon({ code: 'SUNLEAF20', discount: 20 });
      setCouponCode('');
    } else {
      setErrors({ ...errors, coupon: 'Invalid coupon code' });
      setTimeout(() => {
        const newErrors = { ...errors };
        delete newErrors.coupon;
        setErrors(newErrors);
      }, 3000);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const fieldsToValidate = ['email', 'name', 'phone', 'address', 'city'];
    fieldsToValidate.forEach(field => {
      validateField(field, customerInfo[field as keyof typeof customerInfo]);
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const checkoutData = { 
        customerInfo, 
        total, 
        cartItems, 
        appliedCoupon,
        subtotal,
        shipping: 0,
        discount
      };
      
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      router.push('/payment');
    }, 1500);
  };

  const breadcrumbItems = [
    { label: 'Shopping Cart', href: '/Cart' },
    { label: 'Checkout' }
  ];

  if (cartItems.length === 0) {
    return null;
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
            <h1 className={styles.title}>Secure Checkout</h1>
            <p className={styles.subtitle}>Complete your order in just a few steps</p>
            
            <div className={styles.progressBar}>
              <button 
                type="button"
                className={`${styles.progressStep} ${styles.active} ${styles.clickable}`}
                onClick={() => {
                  setIsNavigating(true);
                  router.push('/Cart');
                }}
                disabled={isNavigating}
                title="Back to Cart"
              >
                <div className={styles.stepNumber}>
                  {isNavigating ? (
                    <Loader2 size={20} className={styles.spinnerIcon} />
                  ) : (
                    <ShoppingBag size={20} />
                  )}
                </div>
                <span>Cart</span>
              </button>
              <div className={`${styles.progressLine} ${styles.active}`}></div>
              <div className={`${styles.progressStep} ${styles.active}`}>
                <div className={styles.stepNumber}>2</div>
                <span>Checkout</span>
              </div>
              <div className={styles.progressLine}></div>
              <div className={styles.progressStep}>
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

          <div className={styles.grid}>
            <motion.div 
              className={styles.mainContent}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit}>
                <div className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                      <User className={styles.icon} />
                    </div>
                    <div>
                      <h2>Customer Information</h2>
                      <p className={styles.sectionDesc}>We'll use this to contact you about your order</p>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={(e) => validateField('email', e.target.value)}
                      className={errors.email ? styles.error : ''}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.div 
                          className={styles.errorMessage}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <AlertCircle size={14} />
                          {errors.email}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Cooper Collen"
                        value={customerInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={(e) => validateField('name', e.target.value)}
                        className={errors.name ? styles.error : ''}
                      />
                      <AnimatePresence>
                        {errors.name && (
                          <motion.div 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <AlertCircle size={14} />
                            {errors.name}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number (M-Pesa) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0712345678"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={(e) => validateField('phone', e.target.value)}
                        className={errors.phone ? styles.error : ''}
                      />
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.div 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <AlertCircle size={14} />
                            {errors.phone}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                      <MapPin className={styles.icon} />
                    </div>
                    <div>
                      <h2>Delivery Address</h2>
                      <p className={styles.sectionDesc}>Where should we deliver your order?</p>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Main Street, Apartment 4B"
                      value={customerInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      onBlur={(e) => validateField('address', e.target.value)}
                      className={errors.address ? styles.error : ''}
                    />
                    <AnimatePresence>
                      {errors.address && (
                        <motion.div 
                          className={styles.errorMessage}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <AlertCircle size={14} />
                          {errors.address}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nairobi"
                        value={customerInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        onBlur={(e) => validateField('city', e.target.value)}
                        className={errors.city ? styles.error : ''}
                      />
                      <AnimatePresence>
                        {errors.city && (
                          <motion.div 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <AlertCircle size={14} />
                            {errors.city}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Postal Code</label>
                      <input
                        type="text"
                        placeholder="00100"
                        value={customerInfo.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                      <Tag className={styles.icon} />
                    </div>
                    <div>
                      <h2>Discount Code</h2>
                      <p className={styles.sectionDesc}>Have a promo code? Apply it here</p>
                    </div>
                  </div>

                  {!appliedCoupon ? (
                    <>
                      <div className={styles.couponGroup}>
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className={errors.coupon ? styles.error : ''}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode}
                          className={styles.applyBtn}
                        >
                          Apply
                        </button>
                      </div>
                      <div className={styles.couponHelpWrapper}>
                        <button
                          type="button"
                          className={styles.couponHelpBtn}
                          onClick={() => setShowCouponHelp(!showCouponHelp)}
                        >
                          {showCouponHelp ? 'Hide' : 'Show'} available coupons
                        </button>
                      </div>
                      <AnimatePresence>
                        {showCouponHelp && (
                          <motion.div 
                            className={styles.couponHelp}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className={styles.couponCard}>
                              <div className={styles.couponTag}>SAVE10</div>
                              <div className={styles.couponDiscount}>10% OFF</div>
                              <div className={styles.couponDesc}>Get 10% off your order</div>
                            </div>
                            <div className={styles.couponCard}>
                              <div className={styles.couponTag}>SUNLEAF20</div>
                              <div className={styles.couponDiscount}>20% OFF</div>
                              <div className={styles.couponDesc}>Get 20% off your order</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {errors.coupon && (
                          <motion.div 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <AlertCircle size={14} />
                            {errors.coupon}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <motion.div 
                      className={styles.appliedCoupon}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className={styles.appliedCouponContent}>
                        <Check className={styles.checkIcon} />
                        <div>
                          <div className={styles.appliedCouponCode}>{appliedCoupon.code}</div>
                          <div className={styles.appliedCouponDesc}>
                            {appliedCoupon.discount}% discount applied
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className={styles.removeCouponBtn}
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isProcessing || Object.keys(errors).length > 0}
                >
                  {isProcessing ? (
                    <>
                      <div className={styles.spinner}></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className={styles.btnIcon} />
                    </>
                  )}
                </button>
              </form>
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
                
                <div className={styles.cartItems}>
                  {cartItems.map(item => (
                    <div key={item.id} className={styles.cartItem}>
                      <div className={styles.itemImage}>
                        <img src={item.image} alt={item.name} />
                        <div className={styles.itemBadge}>{item.quantity}</div>
                      </div>
                      <div className={styles.itemDetails}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemMeta}>
                          <span className={styles.itemQty}>Qty: {item.quantity}</span>
                          <span className={styles.itemUnit}>@ KSh {item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className={styles.itemPrice}>
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>KSh {subtotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <motion.div 
                      className={`${styles.summaryRow} ${styles.discount}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span>Discount ({appliedCoupon.discount}%)</span>
                      <span>-KSh {discount.toLocaleString()}</span>
                    </motion.div>
                  )}
                  <div className={styles.summaryTotal}>
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.securityBadges}>
                  <div className={styles.badge}>
                    <Shield size={16} />
                    <span>Secure Checkout</span>
                  </div>
                  <div className={styles.badge}>
                    <Truck size={16} />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
