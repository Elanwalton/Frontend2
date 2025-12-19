'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Sun, Battery, Zap, Lightbulb, Package, Search, 
  SlidersHorizontal, Grid, List, Heart, ShoppingCart,
  Star, TrendingUp, Eye, X, ChevronDown
} from 'lucide-react';
import styles from '@/styles/CategoryProducts.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';
import { buildMediaUrl } from '@/utils/media';
import LoadingSpinner from './LoadingSpinner';

interface Product {
  id: number;
  name: string;
  price: number;
  main_image_url: string;
  category: string;
  rating: number;
  review_count: number;
  brand?: string;
  description?: string;
  stock_quantity?: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count: number;
  color: string;
}

const CategoryProductsContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams?.get('category') || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Update selected category when URL changes
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/sunleaf-tech';
  const API_BASE = API_URL.replace(/\/?api\/?$/i, '');

  const categories: Category[] = [
    { id: 'all', name: 'All Products', icon: Package, count: 0, color: '#6366f1' },
    { id: 'solar panels', name: 'Solar Panels', icon: Sun, count: 0, color: '#f59e0b' },
    { id: 'Batteries', name: 'Batteries', icon: Battery, count: 0, color: '#10b981' },
    { id: 'Inverters', name: 'Inverters', icon: Zap, count: 0, color: '#3b82f6' },
    { id: 'Solar Outdoor Lights', name: 'Floodlights', icon: Lightbulb, count: 0, color: '#8b5cf6' },
    { id: 'Mounting Accesories', name: 'Accessories', icon: Package, count: 0, color: '#ec4899' }
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE}/api/getProductsClients.php`);
        url.searchParams.set('page', String(currentPage));
        url.searchParams.set('limit', '12');
        
        if (selectedCategory && selectedCategory !== 'all') {
          url.searchParams.set('category', selectedCategory);
        }
        
        if (searchQuery) {
          url.searchParams.set('q', searchQuery);
        }

        console.log('Fetching from URL:', url.toString());
        const response = await fetch(url.toString(), {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          const mappedProducts: Product[] = data.data.map((item: any) => ({
            id: Number(item.id),
            name: item.name,
            price: Number(item.price),
            main_image_url: buildMediaUrl(item.main_image_full_url || item.main_image_url),
            category: item.category || 'Uncategorized',
            rating: item.rating ? parseFloat(item.rating) : 0,
            review_count: item.review_count ? parseInt(item.review_count) : 0,
            brand: item.brand || 'Generic',
            description: item.description || '',
            stock_quantity: Number(item.stock_quantity ?? item.quantity ?? 0)
          }));
          
          setProducts(mappedProducts);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, currentPage, API_BASE]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default: // popularity
        return b.review_count - a.review_count;
    }
  });

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // Add to cart logic here
    console.log('Add to cart:', product);
  };

  const handleAddToWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // Add to wishlist logic here
    console.log('Add to wishlist:', product);
  };

  const renderProductImage = (product: Product) => {
    if (product.main_image_url) {
      return (
        <img 
          src={product.main_image_url} 
          alt={product.name}
          className={styles.productImage}
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder.jpg';
          }}
        />
      );
    }
    
    // Fallback gradient based on category
    const categoryColors: Record<string, string> = {
      'solar panels': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Batteries': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'Inverters': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'Solar Outdoor Lights': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      default: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    };
    
    const gradient = categoryColors[product.category] || categoryColors.default;
    
    return (
      <div className={styles.productImagePlaceholder} style={{ background: gradient }}>
        <Package size={48} className={styles.placeholderIcon} />
      </div>
    );
  };

  // Generate breadcrumb items based on selected category
  const getBreadcrumbs = (): Array<{ label: string; href?: string }> => {
    const items: Array<{ label: string; href?: string }> = [{ label: 'Shop', href: '/categories' }];
    
    if (selectedCategory && selectedCategory !== 'all') {
      const currentCategory = categories.find(cat => cat.id === selectedCategory);
      if (currentCategory) {
        items.push({ label: currentCategory.name });
      }
    }
    
    return items;
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={getBreadcrumbs()} />
      
      {/* Categories Bar */}
      <div className={styles.categoriesBar}>
        <div className={styles.categoriesWrapper}>
          <div className={styles.categoriesScroll}>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    // Update URL with category parameter
                    const params = new URLSearchParams();
                    if (category.id !== 'all') {
                      params.set('category', category.id);
                    }
                    router.push(`/categories${params.toString() ? '?' + params.toString() : ''}`);
                  }}
                  className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ''}`}
                  style={isActive ? { backgroundColor: category.color } : {}}
                >
                  <Icon size={20} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Filters & Sort Bar */}
        <div className={styles.controlBar}>
          <div className={styles.controlLeft}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
            <span className={styles.productCount}>
              <span className={styles.productCountBold}>{sortedProducts.length}</span> products found
            </span>
          </div>
          
          <div className={styles.controlRight}>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="popularity">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            
            <div className={styles.viewToggle}>
              <button 
                onClick={() => setViewMode('grid')}
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewButtonActive : ''}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner message="Loading products" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
            {sortedProducts.map((product, index) => {
              const inStock = (product.stock_quantity || 0) > 0;
              
              return (
                <div 
                  key={product.id}
                  className={styles.productCard}
                  onClick={() => handleProductClick(product.id)}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {/* Product Image */}
                  <div className={styles.productImageContainer}>
                    {/* Stock overlay */}
                    {!inStock && (
                      <div className={styles.outOfStockOverlay}>
                        <div className={styles.outOfStockIcon}>
                          <X size={32} />
                        </div>
                        <span className={styles.outOfStockText}>Out of Stock</span>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.actionButton}
                        onClick={(e) => handleAddToWishlist(e, product)}
                        aria-label="Add to wishlist"
                      >
                        <Heart size={18} />
                      </button>
                      <button 
                        className={styles.actionButton}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Quick view"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    {/* Product image */}
                    <div className={styles.imageWrapper}>
                      {renderProductImage(product)}
                    </div>

                    {/* Floating rating badge */}
                    {product.rating > 0 && (
                      <div className={styles.ratingBadge}>
                        <Star size={14} className={styles.starIcon} />
                        <span className={styles.ratingValue}>{product.rating.toFixed(1)}</span>
                        <span className={styles.reviewCount}>({product.review_count})</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    {/* Brand */}
                    {product.brand && (
                      <span className={styles.brandBadge}>{product.brand}</span>
                    )}
                    
                    {/* Title */}
                    <h3 className={styles.productTitle}>{product.name}</h3>

                    {/* Category */}
                    <div className={styles.categoryTag}>
                      <Package size={12} />
                      <span>{product.category}</span>
                    </div>

                    {/* Price section */}
                    <div className={styles.priceSection}>
                      <span className={styles.price}>
                        KSh {product.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Action button */}
                    <button 
                      className={styles.addToCartButton}
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={!inStock}
                    >
                      <ShoppingCart size={20} />
                      <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedProducts.length === 0 && (
          <div className={styles.emptyState}>
            <Package size={64} className={styles.emptyIcon} />
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && sortedProducts.length > 0 && totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            
            <div className={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryProducts: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading products..." />}>
      <CategoryProductsContent />
    </Suspense>
  );
};

export default CategoryProducts;
