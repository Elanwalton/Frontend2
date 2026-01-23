'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import useCartStore from '@/store/UseCartStore';
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
    pros?: string;
    cons?: string;
    would_recommend?: boolean;
    verified_purchase?: boolean;
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
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    comment: '',
    pros: '',
    cons: '',
    would_recommend: true
  });

  // Track product view for personalized recommendations
  useEffect(() => {
    if (typeof window !== 'undefined' && product.id) {
      try {
        // Get existing viewed products
        const viewedStr = localStorage.getItem('recentlyViewed');
        let viewedIds: number[] = viewedStr ? JSON.parse(viewedStr) : [];
        
        const productId = parseInt(product.id);
        
        // Remove if already exists (to move to front)
        viewedIds = viewedIds.filter(id => id !== productId);
        
        // Add current product to the front
        viewedIds.unshift(productId);
        
        // Keep only last 20 viewed products
        viewedIds = viewedIds.slice(0, 20);
        
        // Save back to localStorage
        localStorage.setItem('recentlyViewed', JSON.stringify(viewedIds));
      } catch (error) {
        console.error('Error tracking product view:', error);
      }
    }
  }, [product.id]);

  // Client-side reviews loading for better performance
  const [reviews, setReviews] = useState(product.reviews || []);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch reviews client-side for better initial page load
    async function loadReviews() {
      try {
        setReviewsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost/frontend2-dev';
        const response = await fetch(`${apiUrl}/api/getProductReviews.php?product_id=${product.id}&limit=10`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.reviews) {
            setReviews(data.data.reviews);
          }
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviewsError('Failed to load reviews');
      } finally {
        setReviewsLoading(false);
      }
    }

    loadReviews();
  }, [product.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/frontend2-dev/api';
      const response = await fetch(`${apiUrl}/submitReview.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          ...reviewForm
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToastMessage('Review submitted successfully!');
        setShowToast(true);
        setShowReviewModal(false);
        // Reset form
        setReviewForm({
          author: '',
          rating: 5,
          comment: '',
          pros: '',
          cons: '',
          would_recommend: true
        });
        
        // Refresh page to show new review
        router.refresh();
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert('Failed to submit review: ' + data.message);
      }
    } catch (error) {
       console.error(error);
       alert('An error occurred while submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
                  <Image
                    src={productImages[currentImageIndex]}
                    alt={`${product.name} - ${product.category} Solar Product in Kenya`}
                    width={600}
                    height={600}
                    priority
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
                        <Image 
                          src={img} 
                          alt={`${product.name} - View ${idx + 1}`} 
                          width={100}
                          height={100}
                          loading="lazy"
                        />
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
              <motion.div 
                key="reviews" 
                className={styles.tabContent} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.reviewsLayout}>
                  <div className={styles.reviewsSidebar}>
                    <h3>Customer Feedback</h3>
                    <div className={styles.overallRatingCard}>
                      <div className={styles.ratingLarge}>{product.rating || '0'}</div>
                      <div className={styles.starsLarge}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={20} 
                            className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} 
                          />
                        ))}
                      </div>
                      <div className={styles.totalReviewsSub}>Based on {product.reviewCount || 0} reviews</div>
                      
                      <div className={styles.ratingBarsList}>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className={styles.ratingBarItem}>
                            <span className={styles.barLabel}>{rating}★</span>
                            <div className={styles.barProgressBg}>
                              <motion.div 
                                className={styles.barProgressFill} 
                                initial={{ width: 0 }}
                                animate={{ width: `${((rating === 5 ? 85 : rating === 4 ? 10 : 5) / 100) * 100}%` }} // Simplified for visual
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                            <span className={styles.barCount}>{rating === 5 ? (product.reviewCount || 0) : 0}</span>
                          </div>
                        ))}
                      </div>

                      <button className={styles.primaryWriteBtn} onClick={() => setShowReviewModal(true)}>
                        <MessageSquare size={18} />
                        Share Your Experience
                      </button>
                    </div>
                  </div>

                  <div className={styles.reviewsMain}>
                    <div className={styles.reviewsListHeader}>
                      <h4>All Reviews</h4>
                      <div className={styles.reviewsSort}>
                        <span>Sort by:</span>
                        <select className={styles.sortSelect}>
                          <option>Most Recent</option>
                          <option>Highest Rating</option>
                          <option>Lowest Rating</option>
                        </select>
                      </div>
                    </div>

                    {reviewsLoading ? (
                      <div className={styles.reviewsSkeleton}>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`${styles.skeletonReviewCard} ${styles.skeleton}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#e2e8f0' }} />
                                <div>
                                  <div style={{ width: 120, height: 20, background: '#e2e8f0', borderRadius: 4, marginBottom: 8 }} />
                                  <div style={{ width: 80, height: 16, background: '#e2e8f0', borderRadius: 4 }} />
                                </div>
                              </div>
                            </div>
                            <div style={{ width: '100%', height: 20, background: '#e2e8f0', borderRadius: 4, marginBottom: 10 }} />
                            <div style={{ width: '80%', height: 20, background: '#e2e8f0', borderRadius: 4 }} />
                          </div>
                        ))}
                      </div>
                    ) : reviewsError ? (
                      <div className={styles.errorReviews}>
                        <AlertCircle size={32} />
                        <p>{reviewsError}</p>
                        <button onClick={() => window.location.reload()}>Try Again</button>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className={styles.reviewsList}>
                        {reviews.map((review, index) => (
                          <motion.div 
                            key={review.id} 
                            className={styles.reviewCardPremium}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={styles.reviewTop}>
                              <div className={styles.reviewUser}>
                                <div className={styles.avatarPremium}>
                                  {review.author.charAt(0)}
                                </div>
                                <div className={styles.userInfo}>
                                  <div className={styles.userTop}>
                                    <span className={styles.userName}>{review.author}</span>
                                    {review.verified_purchase && (
                                      <span className={styles.verifiedBadge}>
                                        <Shield size={12} fill="currentColor" /> Verified
                                      </span>
                                    )}
                                  </div>
                                  <span className={styles.reviewDateText}>{review.date}</span>
                                </div>
                              </div>
                              <div className={styles.reviewRatingStars}>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div className={styles.reviewBody}>
                              <p className={styles.reviewContentText}>{review.comment}</p>
                              
                              {(review.pros || review.cons) && (
                                <div className={styles.prosConsGrid}>
                                  {review.pros && (
                                    <div className={styles.prosBox}>
                                      <span className={styles.pcLabel}>What I liked</span>
                                      <div className={styles.pcContent}>
                                        <Check size={14} className="text-green-500" />
                                        {review.pros}
                                      </div>
                                    </div>
                                  )}
                                  {review.cons && (
                                    <div className={styles.consBox}>
                                      <span className={styles.pcLabel}>What could improve</span>
                                      <div className={styles.pcContent}>
                                        <X size={14} className="text-red-500" />
                                        {review.cons}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className={styles.reviewFooter}>
                                <div className={styles.footerLeft}>
                                  {review.would_recommend && (
                                    <div className={styles.recommendationTag}>
                                      <ThumbsUp size={12} /> Recommends this
                                    </div>
                                  )}
                                </div>
                                <div className={styles.footerRight}>
                                  <button className={styles.helpfulAction}>
                                    <ThumbsUp size={14} />
                                    <span>Helpful ({review.helpful || 0})</span>
                                  </button>
                                  <button className={styles.reportAction}>Report</button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyReviews}>
                        <MessageSquare size={48} className={styles.emptyIcon} />
                        <p>No reviews yet. Share your experience with this product!</p>
                        <button className={styles.emptyReviewBtn} onClick={() => setShowReviewModal(true)}>
                          Write First Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Write Review Modal */}
            <AnimatePresence>
              {showReviewModal && (
                <motion.div 
                  className={styles.modalOverlay}
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className={styles.modalContent}
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }}
                  >
                    <div className={styles.modalHeader}>
                      <div>
                        <h3>Write a Review</h3>
                        <p>Share your honest opinion with others</p>
                      </div>
                      <button className={styles.closeModal} onClick={() => setShowReviewModal(false)}>
                        <X size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Cooper Collen"
                            value={reviewForm.author} 
                            onChange={e => setReviewForm({...reviewForm, author: e.target.value})}
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label>Overall Rating</label>
                          <div className={styles.starRatingPicker}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star} 
                                type="button" 
                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                className={star <= reviewForm.rating ? styles.starActive : ''}
                              >
                                <Star 
                                  size={28} 
                                  fill={star <= reviewForm.rating ? 'currentColor' : 'none'} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Your Review</label>
                        <textarea 
                          required 
                          rows={4} 
                          placeholder="What did you like or dislike? How are you using the product?"
                          value={reviewForm.comment}
                          onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                        ></textarea>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.prosLabel}>What I Liked (Pros)</label>
                          <div className={styles.inputIconWrapper}>
                            <Check size={16} className={styles.inputIcon} />
                            <input 
                              type="text" 
                              placeholder="e.g. Fast delivery, high quality"
                              value={reviewForm.pros}
                              onChange={e => setReviewForm({...reviewForm, pros: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.consLabel}>Improvement Areas (Cons)</label>
                          <div className={styles.inputIconWrapper}>
                            <X size={16} className={styles.inputIcon} />
                            <input 
                              type="text" 
                              placeholder="e.g. Slightly heavy"
                              value={reviewForm.cons}
                              onChange={e => setReviewForm({...reviewForm, cons: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxContainer}>
                          <input 
                            type="checkbox" 
                            checked={reviewForm.would_recommend}
                            onChange={e => setReviewForm({...reviewForm, would_recommend: e.target.checked})}
                          />
                          <span className={styles.checkmark}></span>
                          I would recommend this product to others
                        </label>
                      </div>

                      <div className={styles.modalFooter}>
                        <button 
                          type="button" 
                          className={styles.cancelBtn}
                          onClick={() => setShowReviewModal(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmittingReview}
                          className={styles.submitReviewBtn}
                        >
                          {isSubmittingReview ? (
                            <>
                              <div className={styles.btnSpinner}></div>
                              Submitting...
                            </>
                          ) : 'Post Review'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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
