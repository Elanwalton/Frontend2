'use client';
import { getApiUrl } from '@/utils/apiUrl';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle,
  Package,
  TrendingUp,
  Eye,
  Download,
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import styles from './low-stock.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  reorder_level: number;
  price: number;
  inventory_value: number;
  category_name: string;
  units_below_reorder: number;
}

interface LowStockSummary {
  total_low_stock_items: number;
  total_impact: number;
  categories_affected: number;
}

const LowStockAlerts: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [summary, setSummary] = useState<LowStockSummary>({
    total_low_stock_items: 0,
    total_impact: 0,
    categories_affected: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'urgency' | 'value' | 'category'>('urgency');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchLowStockData();
  }, []);

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/inventory/low-stock'));



      const data = await response.json();
      
      setLowStockItems(data.items || []);
      setSummary(data.summary || {
        total_low_stock_items: 0,
        total_impact: 0,
        categories_affected: 0
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch low stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = lowStockItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_name === selectedCategory);
    }

    // Sort based on selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return b.units_below_reorder - a.units_below_reorder;
        case 'value':
          return b.inventory_value - a.inventory_value;
        case 'category':
          return a.category_name.localeCompare(b.category_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [lowStockItems, searchTerm, selectedCategory, sortBy]);

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(lowStockItems.map(item => item.category_name)));
    return cats.sort();
  }, [lowStockItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getUrgencyColor = (unitsBelow: number) => {
    if (unitsBelow >= 10) return 'text-red-600 bg-red-50';
    if (unitsBelow >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getUrgencyLabel = (unitsBelow: number) => {
    if (unitsBelow >= 10) return 'Critical';
    if (unitsBelow >= 5) return 'High';
    return 'Medium';
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading low stock data" />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Low Stock Alerts</h1>
          <p>Products that need immediate attention</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={fetchLowStockData}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardContent}>
            <p className={styles.summaryCardLabel}>Low Stock Items</p>
            <p className={styles.summaryCardValue}>{summary.total_low_stock_items}</p>
            <p className={styles.summaryCardTrend}>
              {lowStockItems.filter(item => item.units_below_reorder >= 10).length} critical
            </p>
          </div>
          <div className={`${styles.summaryCardIcon} text-orange-500`}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardContent}>
            <p className={styles.summaryCardLabel}>Total Value at Risk</p>
            <p className={styles.summaryCardValue}>{formatCurrency(summary.total_impact)}</p>
            <p className={styles.summaryCardTrend}>
              {lowStockItems.length > 0 ? 
                `Avg ${formatCurrency(summary.total_impact / lowStockItems.length)}` : 
                'No items'
              }
            </p>
          </div>
          <div className={`${styles.summaryCardIcon} text-red-500`}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardContent}>
            <p className={styles.summaryCardLabel}>Categories Affected</p>
            <p className={styles.summaryCardValue}>{summary.categories_affected}</p>
            <p className={styles.summaryCardTrend}>
              {lowStockItems.length > 0 ? 
                `${Math.round((summary.categories_affected / lowStockItems.length) * 100)}% coverage` : 
                'No data'
              }
            </p>
          </div>
          <div className={`${styles.summaryCardIcon} text-blue-500`}>
            <Package size={24} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardContent}>
            <p className={styles.summaryCardLabel}>Last Updated</p>
            <p className={styles.summaryCardValue}>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className={styles.summaryCardTrend}>
              {lastUpdated.toLocaleDateString()}
            </p>
          </div>
          <div className={`${styles.summaryCardIcon} text-green-500`}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search Products</label>
            <div className={`${styles.searchWrapper} ${styles.filterInput}`}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                className={`${styles.searchInput} ${styles.filterInput}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <select
              className={`${styles.filterSelect} ${styles.filterInput}`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort By</label>
            <select
              className={`${styles.filterSelect} ${styles.filterInput}`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="urgency">Urgency</option>
              <option value="value">Inventory Value</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('urgency');
              }}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>
            Low Stock Products ({filteredAndSortedItems.length})
          </h2>
          <span className={styles.tableTimestamp}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock Status</th>
                <th>Urgency</th>
                <th>Value at Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div>
                      <div className={styles.productName}>{item.name}</div>
                      <div className={styles.productSku}>{item.sku}</div>
                    </div>
                  </td>
                  <td>
                    {item.category_name}
                  </td>
                  <td>
                    <div className={styles.stockStatus}>
                      <div className={styles.stockQuantity}>
                        <div className="font-medium text-red-600">{item.stock_quantity}</div>
                        <div className="text-xs text-gray-500">of {item.reorder_level}</div>
                      </div>
                      <div className={styles.stockBar}>
                        <div 
                          className={styles.stockBarFill}
                          style={{ width: `${Math.min(100, (item.stock_quantity / item.reorder_level) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.urgencyBadge} ${item.units_below_reorder >= 10 ? styles.urgencyBadgeCritical : item.units_below_reorder >= 5 ? styles.urgencyBadgeHigh : styles.urgencyBadgeMedium}`}>
                      {getUrgencyLabel(item.units_below_reorder)}
                    </span>
                    <div className={styles.urgencyDetails}>
                      {item.units_below_reorder} below reorder
                    </div>
                  </td>
                  <td className={styles.value}>
                    {formatCurrency(item.inventory_value)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionLink}>
                        Order Stock
                      </button>
                      <span className={styles.actionDivider}>|</span>
                      <button className={styles.actionLink}>
                        View History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedItems.length === 0 && (
          <div className={styles.emptyState}>
            <CheckCircle className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>No low stock items found</p>
            <p className={styles.emptyStateSubtext}>All products are above their reorder levels</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;
