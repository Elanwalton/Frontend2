import React, { useState } from "react";
import { Star, X, Package, DollarSign, TrendingUp, BarChart3, ShoppingBag, Tag, Layers, CheckCircle } from "lucide-react";
import styles from '@/styles/ViewProductModal.module.css';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  quantity: number;
  status: string;
  revenue: number;
  rating: number;
  main_image_url?: string;
  thumbnails?: string[];
}

interface ViewProductModalProps {
  product: Product;
  onClose: () => void;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ product, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(product.main_image_url || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Stock OK': '#10b981',
      'Low Stock': '#f59e0b',
      'Reorder': '#8b5cf6',
      'Out of Stock': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusGradient = (status: string) => {
    const gradients: Record<string, string> = {
      'Stock OK': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'Low Stock': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'Reorder': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'Out of Stock': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    };
    return gradients[status] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.container}>
          {/* Left Section - Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
              <div className={styles.mainImageContainer}>
                {selectedImage ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/?public\/?$/i, "") || 'https://api.sunleaftechnologies.co.ke'}/public/${selectedImage}`} 
                    alt={product.name}
                    className={styles.mainImage}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <Package size={80} strokeWidth={1.5} />
                    <p>No Image Available</p>
                  </div>
                )}
              </div>
              <div className={styles.imageOverlay}>
                <div className={styles.imageCount}>
                  <Layers size={16} />
                  {(product.thumbnails?.length || 0) + (product.main_image_url ? 1 : 0)} Photos
                </div>
              </div>
            </div>
            
            {(product.main_image_url || (product.thumbnails && product.thumbnails.length > 0)) && (
              <div className={styles.thumbnailGrid}>
                {product.main_image_url && (
                  <div 
                    className={`${styles.thumbnailWrapper} ${selectedImage === product.main_image_url ? styles.activeThumbnail : ''}`}
                    onClick={() => setSelectedImage(product.main_image_url!)}
                  >
                    <img 
                      src={`${process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/?public\/?$/i, "") || 'https://api.sunleaftechnologies.co.ke'}/public/${product.main_image_url}`} 
                      alt={product.name}
                      className={styles.thumbnail}
                    />
                  </div>
                )}
                {product.thumbnails?.map((thumb, idx) => (
                  <div 
                    key={idx}
                    className={`${styles.thumbnailWrapper} ${selectedImage === thumb ? styles.activeThumbnail : ''}`}
                    onClick={() => setSelectedImage(thumb)}
                  >
                    <img 
                      src={`${process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/?public\/?$/i, "") || 'https://api.sunleaftechnologies.co.ke'}/public/${thumb}`} 
                      alt={`${product.name} ${idx + 1}`}
                      className={styles.thumbnail}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Details */}
          <div className={styles.detailsSection}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <div className={styles.categoryBadge}>
                  <Tag size={14} />
                  {product.category}
                </div>
                <h2 className={styles.productName}>{product.name}</h2>
                {product.brand && (
                  <div className={styles.brandTag}>
                    <ShoppingBag size={14} />
                    <span>{product.brand}</span>
                  </div>
                )}
              </div>
              <div 
                className={styles.statusBadge}
                style={{ background: getStatusGradient(product.status) }}
              >
                <CheckCircle size={16} />
                {product.status}
              </div>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.priceTag}>
                <span className={styles.priceLabel}>Price</span>
                <span className={styles.priceValue}>{formatCurrency(product.price)}</span>
              </div>
              <div className={styles.ratingBox}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? styles.starActive : styles.starInactive}
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className={styles.ratingValue}>{product.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className={styles.statContent}>
                  <div className={styles.statIconLarge}>
                    <Package size={28} strokeWidth={2} />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>In Stock</p>
                    <p className={styles.statValue}>{product.quantity}</p>
                    <p className={styles.statSubtext}>units available</p>
                  </div>
                </div>
              </div>

              <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div className={styles.statContent}>
                  <div className={styles.statIconLarge}>
                    <TrendingUp size={28} strokeWidth={2} />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Total Revenue</p>
                    <p className={styles.statValue}>{formatCurrency(product.revenue)}</p>
                    <p className={styles.statSubtext}>generated</p>
                  </div>
                </div>
              </div>

              <div className={styles.statCard} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div className={styles.statContent}>
                  <div className={styles.statIconLarge}>
                    <BarChart3 size={28} strokeWidth={2} />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Product ID</p>
                    <p className={styles.statValue}>#{product.id}</p>
                    <p className={styles.statSubtext}>unique identifier</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.description}>
              <h3 className={styles.descriptionTitle}>
                <Package size={18} />
                Product Description
              </h3>
              <p className={styles.descriptionText}>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;
