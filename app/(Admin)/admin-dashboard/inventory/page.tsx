'use client';
import { getApiUrl } from '../../utils/apiUrl';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Eye,
  Plus,
  BarChart3,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import MetricCard from '../../components/admin/MetricCard';
import PageHeader from '../../components/admin/PageHeader';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';

interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  recentMovements: number;
}

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

interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  reorder_level: number;
  units_below_reorder: number;
  category_name: string;
  price?: number;
  inventory_value?: number;
}

const InventoryDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentMovements: 0
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      const url = getApiUrl('/api/admin/inventory/overview');
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      
      // Use stats from API response
      const apiStats = data?.stats || {};
      const lowStockItems = data?.lowStockItems || [];
      const topProducts = data?.topProducts || [];
      
      // Set low stock items
      setLowStockItems(lowStockItems);
      
      // Set top products
      setTopProducts(topProducts);

      // Use stats from API instead of calculating incorrectly
      setStats({
        totalProducts: apiStats.totalProducts || 0,
        lowStockItems: apiStats.lowStockItems || 0,
        totalValue: apiStats.totalValue || 0,
        recentMovements: apiStats.recentMovements || 0,
      });
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const metricCards: Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    period: string;
    sparklineData: number[];
    color: string;
  }> = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: '+0%',
      trend: 'neutral',
      period: 'All time',
      sparklineData: [10, 15, 12, 18, 20, 25, 22],
      color: '#1976d2',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      change: stats.lowStockItems > 0 ? '+' + stats.lowStockItems : '0',
      trend: stats.lowStockItems > 0 ? 'up' : 'neutral',
      period: 'Needs attention',
      sparklineData: [2, 3, 2, 4, 3, 5, 4],
      color: '#f57c00',
    },
    {
      title: 'Total Inventory Value',
      value: formatCurrency(stats.totalValue),
      change: '+0%',
      trend: 'neutral',
      period: 'Current value',
      sparklineData: [50000, 55000, 52000, 60000, 65000, 70000, 68000],
      color: '#388e3c',
    },
    {
      title: 'Recent Movements',
      value: stats.recentMovements.toString(),
      change: '+0',
      trend: 'neutral',
      period: 'Last 30 days',
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
      color: '#7b1fa2',
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading inventory data" />;
  }

  return (
    <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Inventory Management"
        subtitle="Monitor and manage your product inventory"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Inventory' }
        ]}
        action={{
          label: 'Adjust Stock',
          icon: <Plus size={18} />,
          onClick: () => router.push('/admin-dashboard/inventory/adjustments'),
          variant: 'contained'
        }}
        icon={<Package size={32} />}
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          mb: 4,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
        }}
      >
        {metricCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
            period={card.period}
            sparklineData={card.sparklineData}
            color={card.color}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          mb: 4,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
        }}
      >
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title="Low Stock Alerts"
            subheader="Products that need restocking"
          />
          <CardContent>
            {lowStockItems.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="body1" color="text.secondary">
                  No low stock items
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {lowStockItems.slice(0, 5).map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index !== 0 && <Divider sx={{ my: 1.5 }} />}
                    <ListItem disableGutters alignItems="flex-start" sx={{ gap: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
                          <AlertTriangle size={18} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.sku} • {item.category_name}
                          </Typography>
                        }
                      />
                      <Stack spacing={0.5} alignItems="flex-end">
                        <StatusBadge status="low-stock" />
                        <Typography variant="caption" color="text.secondary">
                          {item.stock_quantity} in stock
                        </Typography>
                      </Stack>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
            {lowStockItems.length > 5 && (
              <Button
                size="small"
                variant="text"
                endIcon={<ArrowRight size={16} />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/admin-dashboard/inventory/low-stock')}
              >
                View all {lowStockItems.length} low stock items
              </Button>
            )}
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardHeader
            title="Top Products by Value"
            subheader="Highest inventory value items"
          />
          <CardContent>
            {topProducts.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="body1" color="text.secondary">
                  No products found
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {topProducts.map((product, index) => (
                  <React.Fragment key={product.id}>
                    {index !== 0 && <Divider sx={{ my: 1.5 }} />}
                    <ListItem disableGutters alignItems="flex-start" sx={{ gap: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{
                            bgcolor: product.is_low_stock ? 'warning.light' : 'primary.light',
                            color: product.is_low_stock ? 'warning.main' : 'primary.main',
                          }}
                        >
                          {product.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {product.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            SKU: {product.sku} • {product.category_name}
                          </Typography>
                        }
                      />
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(product.inventory_value)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.current_quantity} units @ {formatCurrency(product.price)}
                        </Typography>
                        {product.is_low_stock && (
                          <StatusBadge status="low-stock" size="small" />
                        )}
                      </Stack>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
            }}
          >
            <Stack spacing={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => router.push('/admin-dashboard/inventory/adjustments')}
              >
                Adjust Stock
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Record manual stock updates
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Eye size={18} />}
                onClick={() => router.push('/admin-dashboard/inventory/movements')}
              >
                View Movements
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Review recent transactions
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AlertTriangle size={18} />}
                onClick={() => router.push('/admin-dashboard/inventory/low-stock')}
              >
                Low Stock
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                See all low stock items
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BarChart3 size={18} />}
                disabled
              >
                Reports
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Analytics (coming soon)
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryDashboard;
