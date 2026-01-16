'use client';
import { getApiUrl } from '@/utils/apiUrl';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Plus,
  Minus,
  Package,
  AlertTriangle,
  Save,
  X,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import styles from './adjustments.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHeader from '@/components/admin/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import { Box, Grid, TextField, Button, Typography } from '@mui/material';

type MetricTrend = 'up' | 'down' | 'neutral';

interface Product {
  id: number;
  name: string;
  sku: string;
  current_quantity: number;
  reorder_level: number;
  price: number;
  inventory_value: number;
  is_low_stock: boolean;
  category_name: string;
}

interface Adjustment {
  product_id: number;
  product_name: string;
  product_sku: string;
  current_quantity: number;
  adjustment_quantity: number;
  movement_type: 'purchase' | 'sale' | 'return' | 'adjustment';
  notes: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const StockAdjustments: React.FC = () => {
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');
  const preselectProductId = productIdParam ? Number(productIdParam) : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [autoAddedFromQuery, setAutoAddedFromQuery] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!preselectProductId || autoAddedFromQuery) return;
    if (!products.length) return;

    const product = products.find((p) => p.id === preselectProductId);
    if (!product) return;

    setSearchTerm(product.name);
    addAdjustment(product, 'purchase');
    setAutoAddedFromQuery(true);
  }, [preselectProductId, products, autoAddedFromQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from /inventory/stock-levels.php...');
      const response = await fetch(`${getApiUrl('/api/inventory/stock-levels.php')}`, {
      credentials: 'include'
    });
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products data:', data);
      
      // Convert string values to proper types
      const processedData = data.map((product: any) => ({
        ...product,
        current_quantity: parseInt(product.current_quantity) || 0,
        reorder_level: parseInt(product.reorder_level) || 0,
        price: parseFloat(product.price) || 0,
        inventory_value: parseFloat(product.inventory_value) || 0,
        is_low_stock: product.is_low_stock === '1' || product.is_low_stock === true,
        category_name: product.category_name || ''
      }));
      
      setProducts(processedData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addAdjustment = (product: Product, movementType: 'purchase' | 'sale' | 'return' | 'adjustment') => {
    console.log('Adding adjustment:', { product: product.name, movementType });
    
    const existingAdjustment = adjustments.find(a => a.product_id === product.id);
    
    if (existingAdjustment) {
      // Update existing adjustment
      console.log('Updating existing adjustment');
      setAdjustments(adjustments.map(a => 
        a.product_id === product.id 
          ? { ...a, movement_type: movementType }
          : a
      ));
    } else {
      // Add new adjustment
      console.log('Adding new adjustment');
      const newAdjustment: Adjustment = {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        current_quantity: product.current_quantity,
        adjustment_quantity: movementType === 'sale' ? 1 : 1,
        movement_type: movementType,
        notes: ''
      };
      setAdjustments([...adjustments, newAdjustment]);
    }
    
    setSelectedProduct(null);
  };

  const updateAdjustmentQuantity = (productId: number, quantity: number) => {
    setAdjustments(adjustments.map(a =>
      a.product_id === productId
        ? { ...a, adjustment_quantity: Math.max(1, quantity) }
        : a
    ));
  };

  const updateAdjustmentNotes = (productId: number, notes: string) => {
    setAdjustments(adjustments.map(a =>
      a.product_id === productId
        ? { ...a, notes }
        : a
    ));
  };

  const removeAdjustment = (productId: number) => {
    setAdjustments(adjustments.filter(a => a.product_id !== productId));
  };

  const submitAdjustments = async () => {
    if (adjustments.length === 0) return;

    try {
      setSubmitting(true);
      
      // Submit batch adjustments
      const response = await fetch(`${getApiUrl('/api/inventory/adjust.php')}?`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adjustments: adjustments.map(adjustment => ({
            product_id: adjustment.product_id,
            quantity: adjustment.adjustment_quantity,
            movement_type: adjustment.movement_type,
            notes: adjustment.notes,
            reference_type: 'manual_adjustment'
          }))
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit adjustments');
      }
      
      setSuccessMessage('All adjustments processed successfully!');
      setAdjustments([]);
      fetchProducts();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to submit adjustments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSuccessMessage('Error: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const metrics = React.useMemo(() => {
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.is_low_stock).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.inventory_value) || 0), 0);
    const queued = adjustments.length;

    return [
      {
        title: 'Products',
        value: totalProducts.toLocaleString(),
        change: lowStockCount ? `${lowStockCount} low stock` : 'All healthy',
        trend: (lowStockCount ? 'down' : 'neutral') as MetricTrend,
        period: 'Current',
        sparklineData: Array(10).fill(totalProducts),
        color: '#3b82f6'
      },
      {
        title: 'Queued Adjustments',
        value: queued.toString(),
        change: queued ? 'Ready to process' : 'None queued',
        trend: (queued ? 'up' : 'neutral') as MetricTrend,
        period: 'Current',
        sparklineData: Array(10).fill(queued),
        color: '#10b981'
      },
      {
        title: 'Inventory Value',
        value: formatCurrency(totalInventoryValue),
        change: 'Stock value',
        trend: 'neutral' as MetricTrend,
        period: 'Current',
        sparklineData: Array(10).fill(totalInventoryValue),
        color: '#6b7280'
      },
      {
        title: 'Last Sync',
        value: 'Now',
        change: 'Products loaded',
        trend: 'neutral' as MetricTrend,
        period: 'Current',
        sparklineData: Array(10).fill(1),
        color: '#f59e0b'
      }
    ];
  }, [products, adjustments]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading inventory adjustments" />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Stock Adjustments"
        subtitle="Manually adjust product inventory levels"
        icon={<Package size={24} />}
        action={{
          label: submitting ? 'Processing...' : `Process ${adjustments.length} Adjustment${adjustments.length !== 1 ? 's' : ''}`,
          onClick: submitAdjustments,
          icon: <Save size={18} />,
          variant: 'contained'
        }}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={metric.title}>
            <MetricCard {...metric} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={18} />
              </Box>
            )
          }}
        />

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshCw size={18} />}
          onClick={fetchProducts}
        >
          Refresh
        </Button>
      </Box>

      {successMessage && (
        <Box sx={{ mb: 3 }}>
          <Typography color={successMessage.startsWith('Error:') ? 'error' : 'success.main'}>
            {successMessage}
          </Typography>
        </Box>
      )}

      <div className={styles.contentGrid}>
        {/* Product Selection */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Select Products</h2>
            <p className={styles.cardSubtitle}>Search and select products to adjust</p>
          </div>
          
          <div className={styles.cardContent}>
            {/* Product List */}
            <div className={styles.productList}>
              {filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No products found</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productContent}>
                      <h3 className={styles.productName}>
                        {product.name}
                        {product.is_low_stock && (
                          <AlertTriangle className={styles.lowStockIcon} size={16} />
                        )}
                      </h3>
                      <p className={styles.productDetails}>{product.sku} • {product.category_name}</p>
                      <div className={styles.productStock}>
                        <span className={styles.stockQuantity}>
                          Stock: {product.current_quantity}
                        </span>
                        <span className={styles.stockValue}>
                          Value: {formatCurrency(product.inventory_value)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.productActions}>
                      <button
                        onClick={() => addAdjustment(product, 'purchase')}
                        className={`${styles.actionBtn} ${styles.actionBtnAdd}`}
                        title="Add Stock"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={() => addAdjustment(product, 'sale')}
                        className={`${styles.actionBtn} ${styles.actionBtnRemove}`}
                        title="Remove Stock"
                      >
                        <Minus size={18} />
                      </button>
                      <button
                        onClick={() => addAdjustment(product, 'adjustment')}
                        className={`${styles.actionBtn} ${styles.actionBtnAdjust}`}
                        title="Manual Adjustment"
                      >
                        <Package size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Adjustments Queue */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Adjustments Queue</h2>
            <p className={styles.cardSubtitle}>Review and edit pending adjustments</p>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.adjustmentsQueue}>
              {adjustments.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package className={styles.emptyStateIcon} size={48} />
                  <p className={styles.emptyStateText}>No adjustments queued</p>
                  <p className={styles.emptyStateSubtext}>Select products from the list to add adjustments</p>
                </div>
              ) : (
                adjustments.map((adjustment) => (
                  <div key={adjustment.product_id} className={styles.adjustmentItem}>
                    <div className={styles.adjustmentHeader}>
                      <div className={styles.adjustmentProduct}>
                        <h3 className={styles.adjustmentProductName}>{adjustment.product_name}</h3>
                        <p className={styles.adjustmentProductSku}>{adjustment.product_sku}</p>
                        <p className={styles.adjustmentStock}>
                          Current Stock: {adjustment.current_quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeAdjustment(adjustment.product_id)}
                        className={styles.removeBtn}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className={styles.adjustmentForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className={styles.formInput}
                          value={adjustment.adjustment_quantity}
                          onChange={(e) => updateAdjustmentQuantity(adjustment.product_id, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Type</label>
                        <select
                          className={styles.formSelect}
                          value={adjustment.movement_type}
                          onChange={(e) => {
                            setAdjustments(adjustments.map(a =>
                              a.product_id === adjustment.product_id
                                ? { ...a, movement_type: e.target.value as any }
                                : a
                            ));
                          }}
                        >
                          <option value="purchase">Add Stock</option>
                          <option value="sale">Remove Stock</option>
                          <option value="return">Return</option>
                          <option value="adjustment">Adjustment</option>
                        </select>
                      </div>

                      <div className={`${styles.formGroup} ${styles.formFullWidth}`}>
                        <label className={styles.formLabel}>Notes (Optional)</label>
                        <textarea
                          className={styles.formTextarea}
                          rows={2}
                          placeholder="Add notes about this adjustment..."
                          value={adjustment.notes}
                          onChange={(e) => updateAdjustmentNotes(adjustment.product_id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default StockAdjustments;
