"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, Zap, Shield, Leaf } from 'lucide-react';
import styles from '@/styles/ProductCard.module.css';
import useCartStore from '@/store/UseCartStore';
import useWishlistStore from '@/store/UseWishlistStore';
import { toast } from 'react-toastify';
import { useProductTracking } from '../hooks/useProductTracking';

interface ProductCardProps {
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

const ProductCard: React.FC<{ product: ProductCardProps }> = ({ product }) => {
  const router = useRouter();
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  const { trackEvent } = useProductTracking();
  
  const [isHovered, setIsHovered] = useState(false);
  const [colorTheme, setColorTheme] = useState<'green' | 'blue'>('green');

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart({
      id: product.id,
      name: product.title,
      image: product.image,
      price: product.price,
      quantity: 1,
    });
    trackEvent(product.id, 'add_to_cart');
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
      trackEvent(product.id, 'wishlist');
      toast.success('Added to wishlist!');
    }
  };

  const getStockStatus = () => {
    if (product.stock === undefined || product.stock > 10) return 'In Stock';
    if (product.stock > 0) return `Only ${product.stock} left`;
    return 'Out of Stock';
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Animated gradient overlay */}
      <div className={`${styles.gradientOverlay} ${colorTheme === 'green' ? styles.bgGradientGreen : styles.bgGradientBlue}`} />
      
      {/* Color theme selector */}
      <div className={styles.themeSelector}>
        <button
          onClick={(e) => { e.stopPropagation(); setColorTheme('green'); }}
          className={`${styles.themeButton} ${styles.themeButtonGreen} ${colorTheme === 'green' ? styles.themeButtonActive : ''}`}
        >
          Green
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setColorTheme('blue'); }}
          className={`${styles.themeButton} ${styles.themeButtonBlue} ${colorTheme === 'blue' ? styles.themeButtonActive : ''}`}
        >
          Blue
        </button>
      </div>

      {/* Like button */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }}
        className={styles.likeButton}
      >
        <Heart 
          size={16} 
          className={inWishlist ? styles.heartLiked : styles.heart}
        />
      </button>

      {/* Product image */}
      <div className={`${styles.productImage} ${colorTheme === 'green' ? styles.bgGradientGreen : styles.bgGradientBlue}`}>
        <div className={`${styles.productImageInner} ${isHovered ? styles.productImageHovered : ''}`}>
          <div className={`${styles.productIcon} ${colorTheme === 'green' ? styles.gradientGreen : styles.gradientBlue}`}>
            <img 
              src={product.image} 
              alt={product.title} 
              className={styles.productImg}
            />
          </div>
        </div>
        
        {/* Energy flow animation */}
        <div className={styles.particles}>
          <div className={`${styles.particle} ${styles.particle1} ${colorTheme === 'green' ? styles.accentPulseGreen : styles.accentPulseBlue}`} />
          <div className={`${styles.particle} ${styles.particle2} ${colorTheme === 'green' ? styles.accentPulseGreen : styles.accentPulseBlue}`} />
          <div className={`${styles.particle} ${styles.particle3} ${colorTheme === 'green' ? styles.accentPulseGreen : styles.accentPulseBlue}`} />
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Eco badge */}
        <div className={styles.header}>
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(product.rating) ? styles.star : styles.starEmpty} />
              ))}
            </div>
            <span className={styles.ratingText}>({product.reviews})</span>
          </div>
          <div className={styles.ecoBadge}>
            <Leaf size={14} />
            {product.category}
          </div>
        </div>

        {/* Title and price */}
        <div className={styles.productInfo}>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.description}>{product.description || 'High-quality product with premium features'}</p>
          <div className={styles.pricing}>
            <span className={`${styles.price} ${colorTheme === 'green' ? styles.priceGreen : styles.priceBlue}`}>
              Ksh {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Specs */}
        <div className={styles.specs}>
          <div className={styles.specCard}>
            <div className={styles.specHeader}>
              <Zap size={16} />
              <span className={styles.specLabel}>Stock</span>
            </div>
            <p className={styles.specValue}>{getStockStatus()}</p>
          </div>
          <div className={styles.specCard}>
            <div className={styles.specHeader}>
              <Shield size={16} />
              <span className={styles.specLabel}>Rating</span>
            </div>
            <p className={styles.specValue}>{product.rating.toFixed(1)} / 5.0</p>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          className={`${styles.ctaButton} ${colorTheme === 'green' ? styles.buttonGreen : styles.buttonBlue}`}
          onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={20} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        {/* Bottom info */}
        <div className={styles.footer}>
          <span>✓ Free Delivery</span>
          <span>•</span>
          <span>✓ Warranty</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
