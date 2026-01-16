'use client';
import { getApiUrl } from '@/utils/apiUrl';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ViewProductModal from '@/components/ViewProductModal';
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
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHeader from '@/components/admin/PageHeader';
import MetricCard from '@/components/admin/MetricCard';
import DataTable from '@/components/admin/DataTable';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';

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
  const router = useRouter();
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [viewingProduct, setViewingProduct] = useState<{
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
  } | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
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
  const [actionPendingById, setActionPendingById] = useState<Record<number, boolean>>({});

  const STORAGE_KEY_RESOLVED = 'inventory_low_stock_resolved_v1';
  const STORAGE_KEY_SNOOZED = 'inventory_low_stock_snoozed_v1';

  const readResolvedIds = (): number[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_RESOLVED);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
    } catch {
      return [];
    }
  };

  const readSnoozedMap = (): Record<string, number> => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SNOOZED);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };

  const setResolved = (productId: number) => {
    if (typeof window === 'undefined') return;
    const existing = new Set(readResolvedIds());
    existing.add(productId);
    window.localStorage.setItem(STORAGE_KEY_RESOLVED, JSON.stringify(Array.from(existing)));
  };

  const snooze = (productId: number, untilMs: number) => {
    if (typeof window === 'undefined') return;
    const map = readSnoozedMap();
    map[String(productId)] = untilMs;
    window.localStorage.setItem(STORAGE_KEY_SNOOZED, JSON.stringify(map));
  };

  const isSnoozedNow = (productId: number) => {
    const map = readSnoozedMap();
    const until = Number(map[String(productId)]);
    if (!Number.isFinite(until) || until <= 0) return false;
    return Date.now() < until;
  };

  const purgeExpiredSnoozes = () => {
    if (typeof window === 'undefined') return;
    const map = readSnoozedMap();
    let changed = false;
    const now = Date.now();
    for (const key of Object.keys(map)) {
      const until = Number(map[key]);
      if (!Number.isFinite(until) || until <= now) {
        delete map[key];
        changed = true;
      }
    }
    if (changed) {
      window.localStorage.setItem(STORAGE_KEY_SNOOZED, JSON.stringify(map));
    }
  };

  useEffect(() => {
    purgeExpiredSnoozes();
    fetchLowStockData();
  }, []);

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/inventory/low-stock'), {
      credentials: 'include'
    });



      const data = await response.json();
      
      purgeExpiredSnoozes();
      const resolved = new Set(readResolvedIds());
      const items: LowStockItem[] = (data.items || []).filter((item: LowStockItem) => {
        if (resolved.has(item.id)) return false;
        if (isSnoozedNow(item.id)) return false;
        return true;
      });

      setLowStockItems(items);
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

  const withRowPending = async (productId: number, fn: () => Promise<void>) => {
    if (actionPendingById[productId]) return;
    setActionPendingById((prev) => ({ ...prev, [productId]: true }));
    try {
      await fn();
    } finally {
      setActionPendingById((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleResolve = async (row: LowStockItem) => {
    await withRowPending(row.id, async () => {
      setResolved(row.id);
      setLowStockItems((prev) => prev.filter((i) => i.id !== row.id));
    });
  };

  const handleSnooze = async (row: LowStockItem, minutes: number) => {
    await withRowPending(row.id, async () => {
      const until = Date.now() + minutes * 60 * 1000;
      snooze(row.id, until);
      setLowStockItems((prev) => prev.filter((i) => i.id !== row.id));
    });
  };

  const handleAdjustStockRedirect = async (row: LowStockItem) => {
    await withRowPending(row.id, async () => {
      router.push(`/admin-dashboard/inventory/adjustments?productId=${row.id}`);
    });
  };

  const handleView = async (row: LowStockItem) => {
    await withRowPending(row.id, async () => {
      setViewLoading(true);
      // Fast fallback data (always available)
      const fallback = {
        id: row.id,
        name: row.name,
        description: '',
        category: row.category_name || 'Uncategorized',
        price: Number(row.price || 0),
        quantity: Number(row.stock_quantity || 0),
        status: row.stock_quantity <= 0 ? 'Out of Stock' : 'Low Stock',
        revenue: Number(row.inventory_value || 0),
        rating: 0,
      };

      try {
        const res = await fetch(`${getApiUrl('/api/getproduct')}?id=${row.id}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        const apiProduct = json?.data || json?.product || json?.data?.product;

        if (res.ok && apiProduct && typeof apiProduct === 'object') {
          setViewingProduct({
            ...fallback,
            description: String(apiProduct.description || ''),
            category: String(apiProduct.category || fallback.category),
            price: Number(apiProduct.price ?? fallback.price),
            quantity: Number(apiProduct.stockCount ?? apiProduct.quantity ?? fallback.quantity),
            status: fallback.status,
            rating: Number(apiProduct.rating ?? 0),
            // getproduct.php returns "images" (thumbnail_urls) as array
            thumbnails: Array.isArray(apiProduct.images) ? apiProduct.images : undefined,
          });
          return;
        }
      } catch {
        // ignore and fallback
      } finally {
        setViewLoading(false);
      }

      setViewingProduct(fallback);
    });
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = lowStockItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
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
    if (unitsBelow >= 10) return 'error';
    if (unitsBelow >= 5) return 'warning';
    return 'info';
  };

  const getUrgencyChipColor = (unitsBelow: number) => {
    if (unitsBelow >= 10) return 'error';
    if (unitsBelow >= 5) return 'warning';
    return 'default';
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
    <Box sx={{ p: 3 }}>
      {viewingProduct && (
        <ViewProductModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}

      {/* Header */}
      <PageHeader
        title="Low Stock Alerts"
        subtitle="Products that need immediate attention"
        icon={<AlertTriangle size={24} />}
        action={{
          label: 'Export Report',
          onClick: () => {
            const header = ['id', 'name', 'sku', 'category', 'stock_quantity', 'reorder_level', 'units_below_reorder', 'price', 'inventory_value'];
            const rows = filteredAndSortedItems.map((i) => [
              i.id,
              i.name,
              i.sku,
              i.category_name,
              i.stock_quantity,
              i.reorder_level,
              i.units_below_reorder,
              i.price,
              i.inventory_value
            ]);

            const csv = [header, ...rows]
              .map((r) => r.map((v) => `"${String(v ?? '').replace(/\"/g, '""')}"`).join(','))
              .join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `low-stock-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          },
          icon: <Download size={20} />,
          variant: 'contained'
        }}
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Low Stock Items',
            value: summary.total_low_stock_items.toString(),
            change: `${lowStockItems.filter(item => item.units_below_reorder >= 10).length} critical`,
            trend: 'up' as const,
            period: 'Current',
            sparklineData: Array(10).fill(summary.total_low_stock_items),
            color: '#ff9800'
          },
          {
            title: 'Total Value at Risk',
            value: formatCurrency(summary.total_impact),
            change: lowStockItems.length > 0 ? 
              `Avg ${formatCurrency(summary.total_impact / lowStockItems.length)}` : 
              'No items',
            trend: 'up' as const,
            period: 'Current',
            sparklineData: Array(10).fill(summary.total_impact),
            color: '#f44336'
          },
          {
            title: 'Categories Affected',
            value: summary.categories_affected.toString(),
            change: lowStockItems.length > 0 ? 
              `${Math.round((summary.categories_affected / lowStockItems.length) * 100)}% coverage` : 
              'No data',
            trend: 'neutral' as const,
            period: 'Current',
            sparklineData: Array(10).fill(summary.categories_affected),
            color: '#2196f3'
          },
          {
            title: 'Last Updated',
            value: lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            change: lastUpdated.toLocaleDateString(),
            trend: 'neutral' as const,
            period: 'Current',
            sparklineData: Array(10).fill(1),
            color: '#4caf50'
          }
        ].map((metric) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={metric.title}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
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
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <MenuItem value="urgency">Urgency</MenuItem>
            <MenuItem value="value">Inventory Value</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setSortBy('urgency');
          }}
        >
          Clear
        </Button>
      </Box>

      {/* Low Stock Items Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Low Stock Products ({filteredAndSortedItems.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>

          <DataTable
            columns={[
              {
                id: 'name',
                label: 'Product',
                minWidth: 200,
                format: (value, row) => (
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.sku || 'No SKU'}
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'category_name',
                label: 'Category',
                format: (value) => value || 'No Category'
              },
              {
                id: 'stock_status',
                label: 'Stock Status',
                minWidth: 150,
                format: (value, row) => (
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="error.main">
                      {row.stock_quantity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      of {row.reorder_level}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (row.stock_quantity / row.reorder_level) * 100)}
                      color={getUrgencyColor(row.units_below_reorder)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )
              },
              {
                id: 'units_below_reorder',
                label: 'Urgency',
                minWidth: 120,
                format: (value) => (
                  <Box>
                    <Chip 
                      label={getUrgencyLabel(value)}
                      color={getUrgencyChipColor(value)}
                      size="small"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      {value} below reorder
                    </Typography>
                  </Box>
                )
              },
              {
                id: 'inventory_value',
                label: 'Value at Risk',
                align: 'right',
                format: (value) => (
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(value)}
                  </Typography>
                )
              },
              {
                id: 'actions',
                label: 'Actions',
                minWidth: 190,
                align: 'right',
                format: (_value, row) => {
                  const pending = !!actionPendingById[row.id];
                  return (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="View">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleView(row)}
                            disabled={pending}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Adjust stock">
                        <span>
                          <IconButton size="small" onClick={() => handleAdjustStockRedirect(row)} disabled={pending}>
                            <Package size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Snooze for 24 hours">
                        <span>
                          <IconButton size="small" onClick={() => handleSnooze(row, 24 * 60)} disabled={pending}>
                            <Clock size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Mark as handled">
                        <span>
                          <IconButton size="small" onClick={() => handleResolve(row)} disabled={pending}>
                            <CheckCircle size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  );
                }
              }
            ]}
            rows={filteredAndSortedItems}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LowStockAlerts;
