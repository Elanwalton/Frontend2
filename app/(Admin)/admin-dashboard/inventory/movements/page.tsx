'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';
import styles from './movements.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

interface StockMovement {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity_change: number;
  movement_type: 'purchase' | 'sale' | 'return' | 'adjustment';
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_at: string;
  created_by_name?: string;
  created_at_formatted: string;
  movement_type_display: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const StockMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    product_id: '',
    movement_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchMovements();
  }, [pagination.page, filters]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        product_id: filters.product_id,
        movement_type: filters.movement_type,
        start_date: filters.start_date,
        end_date: filters.end_date
      });
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}/inventory/movements-list.php?${params}`;
      console.log('Fetching movements from:', url);
      
      const response = await fetch(url, { credentials: 'include' });
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movements data:', data);
      
      setMovements(data.movements || []);
      setPagination(prev => ({ 
        ...prev, 
        total: data.pagination?.total || 0,
        total_pages: data.pagination?.total_pages || 1
      }));
    } catch (error) {
      console.error('Failed to fetch movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpCircle className="text-green-500" size={20} />;
      case 'sale':
        return <ArrowDownCircle className="text-red-500" size={20} />;
      case 'return':
        return <RotateCcw className="text-blue-500" size={20} />;
      case 'adjustment':
        return <Plus className="text-purple-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600 bg-green-50';
      case 'sale':
        return 'text-red-600 bg-red-50';
      case 'return':
        return 'text-blue-600 bg-blue-50';
      case 'adjustment':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && movements.length === 0) {
    return <LoadingSpinner fullScreen message="Loading inventory movements" />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Stock Movements</h1>
          <p>Track all inventory changes and adjustments</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={20} />
            New Adjustment
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`}>
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Product SKU</label>
            <div className={`${styles.searchWrapper} ${styles.filterInput}`}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search SKU..."
                className={`${styles.searchInput} ${styles.filterInput}`}
                value={filters.product_id}
                onChange={(e) => handleFilterChange('product_id', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Movement Type</label>
            <select
              className={`${styles.filterSelect} ${styles.filterInput}`}
              value={filters.movement_type}
              onChange={(e) => handleFilterChange('movement_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="return">Return</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Start Date</label>
            <input
              type="date"
              className={styles.filterInput}
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>End Date</label>
            <input
              type="date"
              className={styles.filterInput}
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filtersFooter}>
          <button
            onClick={() => setFilters({ product_id: '', movement_type: '', start_date: '', end_date: '' })}
            className={styles.clearFilters}
          >
            Clear Filters
          </button>
          <span className={styles.filterResults}>
            {pagination.total} movements found
          </span>
        </div>
      </div>

      {/* Movements Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Notes</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>{movement.created_at_formatted}</td>
                  <td>
                    <div>
                      <div>{movement.product_name}</div>
                      <div className={styles.referenceType}>{movement.product_sku}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.movementType}>
                      {getMovementIcon(movement.movement_type)}
                      <span className={`${styles.movementBadge} ${styles[`movementBadge${movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}`]}`}>
                        {movement.movement_type_display}
                      </span>
                    </div>
                  </td>
                  <td className={`${styles.quantity} ${movement.movement_type === 'sale' ? styles.quantityNegative : styles.quantityPositive}`}>
                    {movement.movement_type === 'sale' ? '-' : '+'}{movement.quantity_change}
                  </td>
                  <td>
                    {movement.reference_type ? (
                      <div className={styles.reference}>
                        <div className={styles.referenceType}>{movement.reference_type}</div>
                        {movement.reference_id && (
                          <div className={styles.referenceId}>#{movement.reference_id}</div>
                        )}
                      </div>
                    ) : (
                      <span className={styles.reference}>-</span>
                    )}
                  </td>
                  <td className={styles.notes}>
                    {movement.notes || '-'}
                  </td>
                  <td>
                    {movement.created_by_name || 'System'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={styles.paginationBtn}
            >
              Previous
            </button>
            <span className={`${styles.paginationBtn} ${styles.paginationBtnActive}`}>
              {pagination.page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className={styles.paginationBtn}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovements;
