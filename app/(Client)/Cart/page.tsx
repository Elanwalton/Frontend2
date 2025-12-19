"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Zap, Shield, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from '../../styles/CartPage.module.css';
import useCartStore from '../store/UseCartStore';
import ServiceHighlights from '../../components/ServicesHighlights';
import Breadcrumbs from '../../components/Breadcrumbs';
import RelatedProducts from '../../components/RelatedProducts';

const CartPageContent = () => {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const tax = subtotal * 0.16;
  const total = subtotal + shipping + tax;

  return (
    <>
    <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
    <div className={styles.container}>
      {/* Header Section */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={20} />
          <span>Continue Shopping</span>
        </button>
        <div className={styles.titleWrapper}>
          <div className={styles.iconBadge}>
            <ShoppingCart size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Shopping Cart</h1>
            <p className={styles.subtitle}>{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={styles.main}>
        {/* LEFT - Cart Items */}
        <div className={styles.cartSection}>
          {cartItems.length === 0 ? (
            <motion.div 
              className={styles.emptyCart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.emptyIcon}>
                <ShoppingBag size={64} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Add some amazing solar products to get started!</p>
              <button className={styles.shopButton} onClick={() => router.push('/')}>
                <Zap size={20} />
                Start Shopping
              </button>
            </motion.div>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <motion.div 
                  className={styles.cartItem} 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={styles.itemImage}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className={styles.image}
                    />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    {item.meta && <p className={styles.itemMeta}>{item.meta}</p>}
                    <div className={styles.itemPrice}>
                      <span className={styles.priceLabel}>Price:</span>
                      <span className={styles.priceValue}>Ksh {item.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className={styles.itemTotal}>
                      <span className={styles.totalLabel}>Total:</span>
                      <span className={styles.totalValue}>Ksh {(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <div className={styles.cartFooter}>
                <button className={styles.clearCart} onClick={clearCart}>
                  <Trash2 size={18} />
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT - Order Summary */}
        <motion.div 
          className={styles.summary}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.summaryHeader}>
            <h3>Order Summary</h3>
            <div className={styles.summaryBadge}>
              <ShoppingCart size={20} />
            </div>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span>Subtotal ({totalItems} items)</span>
              <span>Ksh {subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={shipping === 0 ? styles.freeShipping : ''}>
                {shipping === 0 ? 'FREE' : `Ksh ${shipping.toLocaleString()}`}
              </span>
            </div>
            {shipping > 0 && (
              <div className={styles.shippingNote}>
                <Truck size={16} />
                <span>Free shipping on orders over Ksh 5,000</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Tax (16%)</span>
              <span>Ksh {tax.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span className={styles.totalAmount}>Ksh {total.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
          </div>

          <button 
            className={styles.checkoutBtn} 
            disabled={cartItems.length === 0}
            onClick={() => router.push('/checkout')}
          >
            <ShoppingBag size={20} />
            Proceed to Checkout
          </button>

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
        </motion.div>
      </div>
      
      {cartItems.length > 0 && <ServiceHighlights />}
      <RelatedProducts limit={6} title="You Might Also Like" />
    </div>
    </>
  );
};

export default function CartPage() {
  return <CartPageContent />;
}
