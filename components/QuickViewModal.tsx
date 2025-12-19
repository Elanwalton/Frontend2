"use client";
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart } from 'lucide-react';
import styles from '../../styles/QuickViewModal.module.css';
import useCartStore from '../store/UseCartStore';
import useWishlistStore from '../store/UseWishlistStore';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  image: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  stock?: number;
  description?: string;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.title,
      image: product.image,
      price: product.price,
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist({
        id: product.id,
        name: product.title,
        image: product.image,
        price: product.price,
        category: product.category,
      });
      toast.success('Added to wishlist!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>

            <div className={styles.content}>
              <div className={styles.imageSection}>
                <img src={product.image} alt={product.title} className={styles.image} />
              </div>

              <div className={styles.details}>
                <span className={styles.category}>{product.category}</span>
                <h2 className={styles.title}>{product.title}</h2>
                
                <div className={styles.rating}>
                  {'★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))}
                  <span className={styles.reviews}>({product.reviews} reviews)</span>
                </div>

                <p className={styles.price}>Ksh {product.price.toLocaleString()}</p>

                {product.stock !== undefined && (
                  <div className={styles.stock}>
                    {product.stock > 10 ? (
                      <span className={styles.inStock}>In Stock</span>
                    ) : product.stock > 0 ? (
                      <span className={styles.lowStock}>Only {product.stock} left!</span>
                    ) : (
                      <span className={styles.outOfStock}>Out of Stock</span>
                    )}
                  </div>
                )}

                {product.description && (
                  <p className={styles.description}>{product.description}</p>
                )}

                <div className={styles.actions}>
                  <button 
                    className={styles.addToCartBtn} 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  <button 
                    className={`${styles.wishlistBtn} ${inWishlist ? styles.active : ''}`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;