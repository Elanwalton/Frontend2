'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  ShoppingCart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  X,
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import useCartStore from '../store/UseCartStore';
import styles from './product.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  highlights: string[];
  inStock: boolean;
  stockCount: number;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  specifications: { label: string; value: string }[];
  reviews?: {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
  }[];
  badges?: string[];
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const addToCart = useCartStore(state => state.addToCart);
  
  const productImages = product.images || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Black');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'shipping'>('description');

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      image: productImages[0],
      price: product.price,
      quantity,
    });
    setToastMessage('Added to cart!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    setToastMessage(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setToastMessage('Copied to clipboard!');
      setShowToast(true);
      navigator.clipboard.writeText(window.location.href);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.productGrid}>
          {/* Image Section */}
          <div className={styles.imageSection}>
            {product.badges && product.badges.length > 0 && (
              <div className={styles.badges}>
                {product.badges.map((badge, idx) => (
                  <div key={idx} className={idx === 0 ? styles.badge : styles.discountBadge}>
                    {badge}
                  </div>
                ))}
              </div>
            )}

            {productImages.length > 0 ? (
              <>
                <div className={styles.mainImageWrapper}>
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product.name}
                    className={styles.mainImage}
                  />
                  <button className={styles.zoomBtn} onClick={() => setLightboxOpen(true)}>
                    <ZoomIn size={20} />
                  </button>
                  {productImages.length > 1 && (
                    <>
                      <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImage}>
                        <ChevronLeft size={20} />
                      </button>
                      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImage}>
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {productImages.length > 1 && (
                  <div className={styles.thumbnails}>
                    {productImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.activeThumbnail : ''}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.mainImageWrapper}>
                <div className={styles.noImage}>No images available</div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className={styles.detailsSection}>
            <h1 className={styles.productTitle}>{product.name}</h1>

            <div className={styles.ratingSection}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className={styles.ratingText}>{product.rating || '0'}</span>
              <span className={styles.reviewCount}>({product.reviewCount || 0} reviews)</span>
            </div>

            <div className={styles.priceSection}>
              <span className={styles.currentPrice}>Ksh {product.price ? product.price.toLocaleString() : '0'}</span>
              {product.originalPrice && (
                <>
                  <span className={styles.originalPrice}>Ksh {product.originalPrice.toLocaleString()}</span>
                  {product.discount && (
                    <span className={styles.savings}>Save {product.discount}%</span>
                  )}
                </>
              )}
            </div>

            <div className={product.inStock ? styles.stockStatus : ''}>
              {product.inStock ? (
                <>
                  <Check size={18} className={styles.stockIcon} />
                  <span className={styles.inStock}>In Stock</span>
                  {product.stockCount !== null && product.stockCount !== undefined && product.stockCount < 5 && (
                    <span className={styles.lowStock}>Only {product.stockCount} left!</span>
                  )}
                </>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <div className={styles.highlights}>
                <h3>Key Features</h3>
                <ul>
                  {product.highlights.map((highlight, idx) => (
                    <li key={idx}>
                      <Check size={16} />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className={styles.variantSection}>
                <label>Color: {selectedColor}</label>
                <div className={styles.colorOptions}>
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`${styles.colorBtn} ${selectedColor === color.name ? styles.selectedColor : ''}`}
                      onClick={() => setSelectedColor(color.name)}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.variantSection}>
                <label>Size</label>
                <div className={styles.sizeOptions}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.selectedSize : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.quantitySection}>
              <label>Quantity</label>
              <div className={styles.quantityControl}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= Number(product.stockCount)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className={styles.actions}>
              <motion.button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart size={20} />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </motion.button>
              <motion.button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={!product.inStock}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Buy Now
              </motion.button>
              <button
                className={`${styles.iconBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                onClick={handleWishlist}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className={styles.iconBtn} onClick={handleShare}>
                <Share2 size={20} />
              </button>
            </div>

            <div className={styles.deliveryInfo}>
              <div className={styles.infoCard}>
                <Truck size={20} />
                <div>
                  <strong>Free Delivery</strong>
                  <p>On orders over Ksh 5,000</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <Shield size={20} />
                <div>
                  <strong>Warranty</strong>
                  <p>12 months warranty</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <RotateCcw size={20} />
                <div>
                  <strong>Easy Returns</strong>
                  <p>30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className={styles.tabsSection}>
          <div className={styles.tabButtons}>
            {(['description', 'specs', 'reviews', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTabBtn : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="description" className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3>Product Description</h3>
                <p>{product.description}</p>
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div key="specs" className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3>Specifications</h3>
                <table className={styles.specsTable}>
                  <tbody>
                    {product.specifications?.map((spec, idx) => (
                      <tr key={idx}>
                        <td>{spec.label}</td>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3>Customer Reviews</h3>
                <div className={styles.reviewsHeader}>
                  <div className={styles.overallRating}>
                    <div className={styles.ratingNumber}>{product.rating || '0'}</div>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    <div className={styles.totalReviews}>{product.reviewCount || 0} reviews</div>
                  </div>
                  <div className={styles.ratingBreakdown}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className={styles.ratingBar}>
                        <span>{rating}★</span>
                        <div className={styles.barContainer}>
                          <div className={styles.barFill} style={{ width: `${(rating / 5) * 100}%` }} />
                        </div>
                        <span>{Math.floor((rating / 5) * (product.reviewCount || 0))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {product.reviews && product.reviews.length > 0 && (
                  <div className={styles.reviewsList}>
                    {product.reviews.map((review) => (
                      <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAuthor}>
                            <div className={styles.avatar}>{review.author.charAt(0)}</div>
                            <div>
                              <strong>{review.author}</strong>
                              <div className={styles.reviewDate}>{review.date}</div>
                            </div>
                          </div>
                          <div className={styles.reviewStars}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                            ))}
                          </div>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                        <button className={styles.helpfulBtn}>
                          <ThumbsUp size={14} />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button className={styles.writeReviewBtn}>
                  <MessageSquare size={18} />
                  Write a Review
                </button>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div key="shipping" className={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3>Shipping & Returns</h3>
                <div className={styles.shippingContent}>
                  <div className={styles.shippingCard}>
                    <Truck size={32} />
                    <h4>Free Shipping</h4>
                    <p>Free delivery on orders over Ksh 5,000 within Kenya</p>
                  </div>
                  <div className={styles.shippingCard}>
                    <AlertCircle size={32} />
                    <h4>Delivery Time</h4>
                    <p>2-5 business days for Nairobi, 5-7 days for other areas</p>
                  </div>
                  <div className={styles.shippingCard}>
                    <RotateCcw size={32} />
                    <h4>Easy Returns</h4>
                    <p>30-day money-back guarantee if not satisfied</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={20} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <img src={product.images[currentImageIndex]} alt={product.name} />
            <button className={styles.closeLightbox} onClick={() => setLightboxOpen(false)}>
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
