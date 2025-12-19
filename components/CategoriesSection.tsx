"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Zap, Star } from 'lucide-react';
import styles from '@/styles/CategoriesSection.module.css';

interface Banner {
  image: string;
  link: string;
}

interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  tag?: string;
  discount?: string;
  soldInfo?: string;
}

interface CategorySectionProps {
  title: string;
  banners: Banner[];
  products: Product[];
  viewAllLink: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  banners,
  products,
  viewAllLink,
}) => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className={styles.categorySection}>
      {/* Section Title with Icon */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.titleWrapper}>
          <Zap className={styles.titleIcon} size={32} />
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.titleBadge}>
            <TrendingUp size={16} />
            <span>Trending</span>
          </div>
        </div>
        <p className={styles.subtitle}>Discover our curated collection of premium products</p>
      </motion.div>

      {/* Banner Row - Clickable promotional banners */}
      <motion.div 
        className={styles.bannerRow}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {banners.slice(0, 3).map((banner, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link 
              href={banner.link}
              className={`${styles.bannerCard} ${index === 2 ? styles.hideMobile : ''}`}
            >
              <div className={styles.bannerGlow} />
              <div className={styles.bannerImageWrapper}>
                <Image
                  src={banner.image}
                  alt={`${title} promotional banner`}
                  fill
                  className={styles.bannerImage}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className={styles.bannerOverlay}>
                <ArrowRight className={styles.bannerArrow} size={24} />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Subheading */}
      <motion.div 
        className={styles.subheadingWrapper}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Star className={styles.subheadingIcon} size={24} />
        <h3 className={styles.subheading}>Best deals on {title}</h3>
        <div className={styles.subheadingLine} />
      </motion.div>

      {/* Product Grid */}
      <motion.div 
        className={styles.productGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {products.slice(0, 6).map((product, index) => (
          <motion.div 
            key={product.id} 
            className={styles.productCard}
            variants={itemVariants}
            onHoverStart={() => setHoveredProduct(product.id)}
            onHoverEnd={() => setHoveredProduct(null)}
            whileHover={{ y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Product Glow Effect */}
            <div className={`${styles.productGlow} ${hoveredProduct === product.id ? styles.productGlowActive : ''}`} />
            
            {/* Product Tags */}
            {(product.tag || product.discount) && (
              <div className={styles.productTags}>
                {product.tag && (
                  <motion.span 
                    className={styles.tagHot}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {product.tag}
                  </motion.span>
                )}
                {product.discount && (
                  <motion.span 
                    className={styles.tagDiscount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
                  >
                    {product.discount}
                  </motion.span>
                )}
              </div>
            )}

            {/* Product Image */}
            <div className={styles.productImageWrapper}>
              {product.image.startsWith('http') ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className={styles.productImage}
                />
              ) : (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className={styles.productImage}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
              <div className={styles.imageOverlay}>
                <motion.div
                  className={styles.quickViewBtn}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: hoveredProduct === product.id ? 1 : 0,
                    scale: hoveredProduct === product.id ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Quick View
                </motion.div>
              </div>
            </div>

            {/* Product Info */}
            <div className={styles.productInfo}>
              <h4 className={styles.productTitle}>{product.title}</h4>
              
              <div className={styles.priceWrapper}>
                <span className={styles.price}>{product.price}</span>
                {product.oldPrice && (
                  <span className={styles.oldPrice}>{product.oldPrice}</span>
                )}
              </div>

              {product.soldInfo && (
                <p className={styles.soldInfo}>
                  <TrendingUp size={14} className={styles.soldIcon} />
                  {product.soldInfo}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <motion.div 
        className={styles.viewAllWrapper}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Link href={viewAllLink} className={styles.viewAllButton}>
          <span>View All {title}</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowRight className={styles.arrowIcon} size={20} />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
};

export default CategorySection;