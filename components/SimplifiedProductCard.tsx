"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Star, Zap, Award, TrendingUp } from 'lucide-react';
import styles from '@/styles/SimplifiedProductCard.module.css';

interface SimplifiedProductCardProps {
  id: number;
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating?: number;
  reviews?: number;
  tag?: string;
  soldInfo?: string;
  category?: string;
  description?: string;
}

const SimplifiedProductCard: React.FC<SimplifiedProductCardProps> = ({
  id,
  image,
  title,
  price,
  oldPrice,
  discount,
  rating = 4.9,
  reviews = 0,
  category,
  description,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewDetails = () => {
    router.push(`/product/${id}`);
  };

  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discount && (
        <div className={styles.discountBadge}>
          {discount}
        </div>
      )}

      {/* Product Image Container */}
      <div className={styles.imageContainer}>
        {/* Decorative background elements */}
        <div className={styles.decorativeBackground}>
          <div className={styles.bgCircle1} />
          <div className={styles.bgCircle2} />
        </div>
        
        {/* Product Image */}
        <div className={`${styles.imageWrapper} ${isHovered ? styles.imageHovered : ''}`}>
          <img 
            src={image} 
            alt={title}
            className={styles.productImage}
          />
        </div>

        {/* Hover overlay with specs */}
        <div className={`${styles.hoverOverlay} ${isHovered ? styles.overlayVisible : ''}`}>
          <div className={styles.specsContainer}>
            <div className={styles.specItem}>
              <Zap size={20} className={styles.specIconYellow} />
              <span className={styles.specText}>High Quality</span>
            </div>
            <div className={styles.specItem}>
              <TrendingUp size={20} className={styles.specIconGreen} />
              <span className={styles.specText}>Best Seller</span>
            </div>
            <div className={styles.specItem}>
              <Award size={20} className={styles.specIconBlue} />
              <span className={styles.specText}>Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Rating */}
        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}
              />
            ))}
          </div>
          <span className={styles.ratingValue}>({rating.toFixed(1)})</span>
          {reviews > 0 && (
            <span className={styles.reviewCount}>· {reviews} reviews</span>
          )}
        </div>

        {/* Title */}
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>
            {description || category || 'High efficiency solar product'}
          </p>
        </div>

        {/* Price */}
        <div className={styles.priceContainer}>
          <span className={styles.price}>{price}</span>
          {oldPrice && (
            <span className={styles.oldPrice}>{oldPrice}</span>
          )}
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureDotGreen} />
            <span>In Stock</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureDotBlue} />
            <span>Free Shipping</span>
          </div>
        </div>

        {/* View Details Button */}
        <button className={styles.viewButton} onClick={handleViewDetails}>
          <Eye size={20} className={styles.buttonIcon} />
          View Details
        </button>
      </div>

      {/* Bottom accent line */}
      <div className={styles.accentLine} />
    </div>
  );
};

export default SimplifiedProductCard;
