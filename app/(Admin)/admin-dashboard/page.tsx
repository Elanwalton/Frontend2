'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiUrl';
import { apiGet } from '@/utils/apiClient';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as DollarSignIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as LoaderIcon,
  Schedule as ClockIcon,
  Cancel as XCircleIcon,
  Warning as AlertTriangleIcon,
  Search as SearchIcon,
  WbSunny as SunIcon,
  BatteryFull as BatteryIcon,
  FlashOn as ZapIcon,
  Inventory as PackageIcon,
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '@/components/admin/MetricCard';
import DateRangePicker, { DateRange } from '@/components/admin/DateRangePicker';
import { ChartSkeleton, TableSkeleton, ListSkeleton } from '@/components/admin/WidgetSkeleton';
import PageHeader from '@/components/admin/PageHeader';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function DashboardOverview() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: 'Last 30 days'
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for analytics data
  const [metrics, setMetrics] = useState({
    totalRevenue: { value: 0, change: 0, trend: 'neutral' as 'up' | 'down' | 'neutral', sparkline: [] as number[] },
    totalOrders: { value: 0, change: 0, trend: 'neutral' as 'up' | 'down' | 'neutral', sparkline: [] as number[] },
    conversionRate: { value: 0, change: 0, trend: 'neutral' as 'up' | 'down' | 'neutral' },
    avgOrderValue: { value: 0, change: 0, trend: 'neutral' as 'up' | 'down' | 'neutral' },
  });

  const [trafficSources, setTrafficSources] = useState<Array<{
    source: string;
    visitors: number;
    percentage: number;
    color: string;
    sessions: number;
  }>>([]);
  const [trafficLoading, setTrafficLoading] = useState<boolean>(false);
  const [trafficError, setTrafficError] = useState<string | null>(null);
  
  const [trafficData, setTrafficData] = useState<Array<{
    day: string;
    visitors: number;
    pageViews: number;
  }>>([]);
  const [trafficSummary, setTrafficSummary] = useState<{
    totalVisitors: number;
    totalPageViews: number;
    visitorsChange: number;
    pageViewsChange: number;
  }>({
    totalVisitors: 0,
    totalPageViews: 0,
    visitorsChange: 0,
    pageViewsChange: 0,
  });

  // State for inventory data
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentMovements: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<Array<{
    name: string;
    stock: number;
    reorderLevel: number;
    status: 'critical' | 'warning';
  }>>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Array<{
    status: string;
    count: number;
    total: number;
  }>>([]);
  const [bestSellers, setBestSellers] = useState<Array<{
    id: number;
    name: string;
    rank: number;
    revenue: number;
    units_sold: number;
    stock?: number;
    category?: string;
  }>>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{
    category: string;
    revenue: number;
    percentage: number;
    units: number;
  }>>([]);
  const [cartAbandonment, setCartAbandonment] = useState({
    abandonmentRate: 0,
    abandonedCarts: 0,
    completedCarts: 0,
    potentialRevenue: 0,
    convertedRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: number;
    order_number: string;
    customer: string;
    email: string;
    amount: number;
    status: string;
    date: string;
  }>>([]);

  // Fetch real analytics data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchAnalyticsData = async () => {
      try {
        const params = new URLSearchParams({
          start_date: dateRange.startDate.toISOString().slice(0, 10),
          end_date: dateRange.endDate.toISOString().slice(0, 10),
        });

        const metricsUrl = getApiUrl('/api/admin/getDashboardMetrics');

        const response = await fetch(`${metricsUrl}?${params.toString()}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Dashboard metrics request failed (${response.status})`);
        }

        const payload = await response.json();

        if (!payload.success) {
          throw new Error(payload.error || 'Failed to load dashboard metrics');
        }

        const metricsData = payload.metrics;

        setMetrics({
          totalRevenue: {
            value: metricsData.total_revenue.value || 0,
            change: metricsData.total_revenue.change || 0,
            trend: metricsData.total_revenue.trend || 'neutral',
            sparkline: metricsData.total_revenue.sparkline || [],
          },
          totalOrders: {
            value: metricsData.total_orders.value || 0,
            change: metricsData.total_orders.change || 0,
            trend: metricsData.total_orders.trend || 'neutral',
            sparkline: metricsData.total_orders.sparkline || [],
          },
          conversionRate: {
            value: metricsData.conversion_rate.value || 0,
            change: metricsData.conversion_rate.change || 0,
            trend: metricsData.conversion_rate.trend || 'neutral',
          },
          avgOrderValue: {
            value: metricsData.avg_order_value.value || 0,
            change: metricsData.avg_order_value.change || 0,
            trend: metricsData.avg_order_value.trend || 'neutral',
          },
        });

        const ordersStatus = (payload.orders_by_status || []).map((item: any) => ({
          status: item.status,
          count: Number(item.count || 0),
          total: Number(item.total || 0),
        }));
        setOrdersByStatus(ordersStatus);

        setBestSellers((payload.best_sellers || []).map((item: any, index: number) => ({
          id: item.id,
          name: item.name,
          rank: index + 1,
          revenue: Number(item.revenue || 0),
          units_sold: Number(item.units_sold || 0),
          stock: item.stock ?? undefined,
          category: item.category ?? undefined,
        })));

        setLowStockItems((payload.low_stock || []).map((item: any) => ({
          name: item.name,
          stock: Number(item.stock || 0),
          reorderLevel: Number(item.reorder_level || 0),
          status: Number(item.stock || 0) <= Number(item.reorder_level || 0) / 2 ? 'critical' : 'warning',
        })));

        setRecentOrders((payload.recent_orders || []).map((item: any) => ({
          id: item.id,
          order_number: item.order_number,
          customer: item.customer,
          email: item.email,
          amount: Number(item.amount || 0),
          status: item.status,
          date: item.date,
        })));

        const sparklineLength = metricsData.total_revenue.sparkline?.length || 12;
        const fallbackDays = Array.from({ length: sparklineLength }, (_, i) => i);

        // Fallback traffic data until real analytics load
        setTrafficData(fallbackDays.map((value: number, index: number) => ({
          day: `D${index + 1}`,
          visitors: value,
          pageViews: value,
        })));

        setCategoryBreakdown((payload.best_sellers || []).map((product: any) => ({
          category: product.category || product.name,
          revenue: Number(product.revenue || 0),
          percentage: metricsData.total_revenue.value
            ? Number(((product.revenue || 0) / metricsData.total_revenue.value) * 100)
            : 0,
          units: Number(product.units_sold || 0),
        })));

        const cartData = payload.cart_abandonment || {};
        setCartAbandonment({
          abandonmentRate: Number(cartData.abandonment_rate || 0),
          abandonedCarts: Number(cartData.abandoned_carts || 0),
          completedCarts: Number(cartData.completed_carts || 0),
          potentialRevenue: Number(cartData.potential_revenue || 0),
          convertedRevenue: Number(cartData.converted_revenue || 0),
        });

        setInventoryStats({
          totalProducts: payload.low_stock?.length || 0,
          lowStockItems: payload.low_stock?.length || 0,
          totalValue: payload.metrics?.total_revenue?.value || 0,
          recentMovements: payload.recent_orders?.length || 0,
        });

      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        console.error('Error details:', err instanceof Error ? err.message : 'Unknown error');
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [dateRange]);

  // Fetch real traffic sources from analytics API (GA4-backed)
  useEffect(() => {
    const fetchTrafficSources = async () => {
      try {
        setTrafficLoading(true);
        setTrafficError(null);

        const trafficUrl = getApiUrl('/api/analytics/trafficSources');
        const response = await fetch(trafficUrl, { 
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Traffic sources request failed (${response.status})`);
        }

        const payload = await response.json();

        if (!payload.success) {
          throw new Error(payload.error || 'Failed to load traffic sources');
        }

        const data = Array.isArray(payload.data) ? payload.data : [];
        const colors = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'];

        setTrafficSources(
          data.map((item: any, index: number) => ({
            source: item.source || 'direct',
            visitors: Number(item.users ?? item.sessions ?? 0),
            percentage: Number(item.percentage ?? 0),
            color: colors[index % colors.length],
            sessions: Number(item.sessions ?? 0),
          }))
        );
      } catch (err) {
        console.error('Failed to fetch traffic sources:', err);
        setTrafficError('Failed to load traffic sources');
      } finally {
        setTrafficLoading(false);
      }
    };

    fetchTrafficSources();
  }, []);

  // Fetch website traffic (visitors & page views) from analytics dailyMetrics API
  useEffect(() => {
    const fetchDailyMetrics = async () => {
      try {
        const dailyUrl = getApiUrl('/api/analytics/dailyMetrics');
        const response = await fetch(dailyUrl, { 
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Daily metrics request failed (${response.status})`);
        }

        const payload = await response.json();

        if (!payload.success) {
          throw new Error(payload.error || 'Failed to load daily metrics');
        }

        const data: Array<{ date: string; visitors: number; pageViews: number }> = payload.data || [];

        // Use last 7 days for the dashboard chart
        const lastSeven = data.slice(-7);

        const chartData = lastSeven.map((item) => ({
          day: item.date.slice(5),
          visitors: Number(item.visitors || 0),
          pageViews: Number(item.pageViews || 0),
        }));

        setTrafficData(chartData);

        // Compute headline metrics for "Unique Visitors" and "Page Views"
        const totalVisitors = lastSeven.reduce((sum, d) => sum + Number(d.visitors || 0), 0);
        const totalPageViews = lastSeven.reduce((sum, d) => sum + Number(d.pageViews || 0), 0);

        const prevSeven = data.slice(-14, -7);
        const prevVisitors = prevSeven.reduce((sum, d) => sum + Number(d.visitors || 0), 0);
        const prevPageViews = prevSeven.reduce((sum, d) => sum + Number(d.pageViews || 0), 0);

        const visitorsChange = prevVisitors > 0
          ? ((totalVisitors - prevVisitors) / prevVisitors) * 100
          : 0;
        const pageViewsChange = prevPageViews > 0
          ? ((totalPageViews - prevPageViews) / prevPageViews) * 100
          : 0;

        setTrafficSummary({
          totalVisitors,
          totalPageViews,
          visitorsChange,
          pageViewsChange,
        });
      } catch (err) {
        console.error('Failed to fetch daily traffic metrics:', err);
      }
    };

    fetchDailyMetrics();
  }, []);
  // Hero Metrics with longer sparkline data (40 data points)
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);

  const heroMetrics = [
    { 
      title: 'Total Revenue', 
      value: metrics.totalRevenue.value
        ? formatCurrency(metrics.totalRevenue.value)
        : 'KSh 0',
      change: `${metrics.totalRevenue.change >= 0 ? '+' : ''}${metrics.totalRevenue.change.toFixed(2)}%`,
      trend: metrics.totalRevenue.trend,
      period: dateRange.label,
      sparklineData: metrics.totalRevenue.sparkline.length ? metrics.totalRevenue.sparkline : Array(40).fill(0),
      color: '#10b981'
    },
    { 
      title: 'Total Orders', 
      value: metrics.totalOrders.value.toLocaleString(),
      change: `${metrics.totalOrders.change >= 0 ? '+' : ''}${metrics.totalOrders.change.toFixed(2)}%`,
      trend: metrics.totalOrders.trend,
      period: dateRange.label,
      sparklineData: metrics.totalOrders.sparkline.length ? metrics.totalOrders.sparkline : Array(40).fill(0),
      color: '#ef4444'
    },
    { 
      title: 'Conversion Rate', 
      value: `${metrics.conversionRate.value.toFixed(2)}%`,
      change: `${metrics.conversionRate.change >= 0 ? '+' : ''}${metrics.conversionRate.change.toFixed(2)}%`,
      trend: metrics.conversionRate.trend,
      period: dateRange.label,
      sparklineData: metrics.totalOrders.sparkline.length ? metrics.totalOrders.sparkline : Array(40).fill(0),
      color: '#a855f7'
    },
    { 
      title: 'Avg. Order Value', 
      value: metrics.avgOrderValue.value
        ? formatCurrency(metrics.avgOrderValue.value)
        : 'KSh 0',
      change: `${metrics.avgOrderValue.change >= 0 ? '+' : ''}${metrics.avgOrderValue.change.toFixed(2)}%`,
      trend: metrics.avgOrderValue.trend,
      period: dateRange.label,
      sparklineData: metrics.totalRevenue.sparkline.length ? metrics.totalRevenue.sparkline : Array(40).fill(0),
      color: '#6b7280'
    }
  ];

  // Revenue trend data
  const revenueData = metrics.totalRevenue.sparkline.length
    ? metrics.totalRevenue.sparkline.map((value, index) => ({
        month: `D${index + 1}`,
        revenue: value,
      }))
    : Array.from({ length: 12 }, (_, index) => ({ month: `M${index + 1}`, revenue: 0 }));

  // Orders by Status
  const ordersByStatusData = ordersByStatus.length
    ? ordersByStatus.map((status) => ({
        status: status.status,
        count: status.count,
        percentage:
          metrics.totalOrders.value > 0
            ? Math.round((status.count / metrics.totalOrders.value) * 100)
            : 0,
        color:
          status.status.toLowerCase() === 'completed'
            ? '#10b981'
            : status.status.toLowerCase() === 'processing'
              ? '#3b82f6'
              : status.status.toLowerCase() === 'pending'
                ? '#f59e0b'
                : '#ef4444',
        icon:
          status.status.toLowerCase() === 'completed'
            ? CheckCircleIcon
            : status.status.toLowerCase() === 'processing'
              ? LoaderIcon
              : status.status.toLowerCase() === 'pending'
                ? ClockIcon
                : XCircleIcon,
      }))
    : [
        { status: 'No data', count: 0, percentage: 0, color: '#94a3b8', icon: LoaderIcon },
      ];

  // Best Selling Products
  const bestSellersDisplay = bestSellers.length
    ? bestSellers
    : [
        {
          id: 0,
          rank: 1,
          name: 'No data available',
          revenue: 0,
          units_sold: 0,
          stock: 0,
          category: '—',
        },
      ];

  // Low Stock Alerts - using real data from API
  const lowStockItemsData = lowStockItems;

  // Revenue by Category
  const categoryRevenue = categoryBreakdown.length
    ? categoryBreakdown.map((cat) => ({
        category: cat.category,
        revenue: cat.revenue,
        percentage: cat.percentage,
        units: cat.units,
        color: '#081e31',
      }))
    : [
        { category: 'No data', revenue: 0, percentage: 0, units: 0, color: '#cbd5f5' },
      ];

  
  // Recent Orders
  const recentOrdersDisplay = recentOrders.length
    ? recentOrders
    : [
        {
          id: 0,
          order_number: 'No orders',
          customer: '—',
          email: '—',
          amount: 0,
          status: 'pending',
          date: new Date().toISOString(),
        },
      ];

  const cartRate = Math.min(Math.max(cartAbandonment.abandonmentRate || 0, 0), 100);
  const abandonedCarts = Math.max(cartAbandonment.abandonedCarts || 0, 0);
  const completedCarts = Math.max(cartAbandonment.completedCarts || 0, 0);
  const potentialRevenue = cartAbandonment.potentialRevenue || 0;
  const convertedRevenue = cartAbandonment.convertedRevenue || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ pt: 6 }}>
      {/* Error Display */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', border: '1px solid', borderColor: 'error.main' }}>
          <Typography color="error.main" fontWeight="600">
            ⚠️ {error}
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
            Showing fallback data. Please check your API server.
          </Typography>
        </Paper>
      )}

      {/* Enhanced Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <PageHeader
          title="Dashboard Overview"
          subtitle="Monitor your key metrics and performance in real-time"
          icon={<DashboardIcon sx={{ fontSize: 32 }} />}
          breadcrumbs={[
            { label: 'Home', href: '/admin-dashboard' },
            { label: 'Dashboard' }
          ]}
        />
        <Box sx={{ mt: 1 }}>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </Box>
      </Box>

      {/* Hero Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {heroMetrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              period={metric.period}
              sparklineData={metric.sparklineData}
              color={metric.color}
              loading={loading}
              onClick={() => console.log(`Navigate to ${metric.title} details`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {loading ? (
            <ChartSkeleton height={300} />
          ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Revenue Trend</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly revenue over the last year
                  </Typography>
                </Box>
                <Select size="small" defaultValue="12months">
                  <MenuItem value="12months">Last 12 months</MenuItem>
                  <MenuItem value="6months">Last 6 months</MenuItem>
                  <MenuItem value="3months">Last 3 months</MenuItem>
                </Select>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#081e31" 
                    strokeWidth={3}
                    dot={{ fill: '#081e31', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          )}
        </Grid>

        {/* Orders by Status */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {loading ? (
            <ListSkeleton items={4} />
          ) : (
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Orders by Status</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Current month breakdown
              </Typography>
              <Stack spacing={3}>
                {ordersByStatusData.map((order, index) => {
                  const Icon = order.icon;
                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon sx={{ color: order.color, fontSize: 20 }} />
                          <Typography variant="body2" fontWeight="medium">{order.status}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1" fontWeight="bold">{order.count}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({order.percentage}%)
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={order.percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: order.color,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
          )}
        </Grid>
      </Grid>

      {/* Best Sellers & Low Stock */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Best Selling Products */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Best Selling Products</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Top 5 items this month
              </Typography>
              <Stack spacing={2}>
                {bestSellers.map((product) => (
                  <Paper key={product.rank} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#081e31', width: 32, height: 32, fontSize: 14, fontWeight: 'bold' }}>
                        #{product.rank}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="600">{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{product.category}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="bold">{product.revenue}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {product.units_sold} units sold
                      </Typography>
                      {product.stock !== undefined && (
                        <Typography 
                          variant="caption" 
                          fontWeight="600"
                          color={product.stock < 50 ? 'error.main' : 'text.secondary'}
                        >
                          Stock: {product.stock}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
          )}
        </Grid>

        {/* Low Stock Alerts */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {loading ? (
            <ListSkeleton items={5} />
          ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AlertTriangleIcon sx={{ color: 'warning.main' }} />
                <Typography variant="h6" fontWeight="bold">Low Stock Alerts</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Items requiring attention
              </Typography>
              <Stack spacing={2}>
                {lowStockItemsData.map((item, index) => (
                  <Paper 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      border: 2, 
                      borderColor: item.status === 'critical' ? 'error.light' : 'warning.light',
                      bgcolor: item.status === 'critical' ? 'error.50' : 'warning.50'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">{item.name}</Typography>
                      <Chip 
                        label={item.status === 'critical' ? 'CRITICAL' : 'WARNING'}
                        size="small"
                        color={item.status === 'critical' ? 'error' : 'warning'}
                        sx={{ fontWeight: 'bold', fontSize: 10 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">
                        Current: <strong>{item.stock}</strong>
                      </Typography>
                      <Typography variant="caption">
                        Reorder: <strong>{item.reorderLevel}</strong>
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(item.stock / item.reorderLevel) * 100}
                      color={item.status === 'critical' ? 'error' : 'warning'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Paper>
                ))}
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Link href="/admin-dashboard/inventory/low-stock" passHref>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'warning.main',
                      color: 'warning.main',
                      '&:hover': { 
                        borderColor: 'warning.dark',
                        bgcolor: 'warning.50'
                      }
                    }}
                  >
                    View All Low Stock Items
                  </Button>
                </Link>
              </Box>
            </CardContent>
          </Card>
          )}
        </Grid>
      </Grid>

      {/* Website Traffic & Cart Abandonment */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Website Traffic */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {loading ? (
            <ChartSkeleton height={250} />
          ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Website Traffic</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visitors and page views (Last 7 days)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Unique Visitors</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {trafficSummary.totalVisitors.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color={trafficSummary.visitorsChange >= 0 ? 'success.main' : 'error.main'} fontWeight="600">
                      {`${trafficSummary.visitorsChange >= 0 ? '+' : ''}${trafficSummary.visitorsChange.toFixed(1)}%`}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Page Views</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {trafficSummary.totalPageViews.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color={trafficSummary.pageViewsChange >= 0 ? 'success.main' : 'error.main'} fontWeight="600">
                      {`${trafficSummary.pageViewsChange >= 0 ? '+' : ''}${trafficSummary.pageViewsChange.toFixed(1)}%`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#081e31" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pageViews" fill="#3b82f6" opacity={0.4} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          )}
        </Grid>

        {/* Cart Abandonment */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {loading ? (
            <ListSkeleton items={3} />
          ) : (
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Cart Abandonment</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Recovery opportunity
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: (theme) => `conic-gradient(${theme.palette.error.main} 0deg ${cartRate * 3.6}deg, ${theme.palette.grey[200]} ${cartRate * 3.6}deg 360deg)`
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 18,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold">{`${Math.round(cartRate)}%`}</Typography>
                    <Typography variant="caption" color="text.secondary">Abandoned</Typography>
                  </Box>
                </Box>
              </Box>

              <Stack spacing={2}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.light' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="600">Abandoned Carts</Typography>
                    <Typography variant="h6" fontWeight="bold" color="error.main">{abandonedCarts.toLocaleString()}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Potential revenue: {formatCurrency(potentialRevenue)}
                  </Typography>
                </Paper>
                
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="600">Completed</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">{completedCarts.toLocaleString()}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Converted revenue: {formatCurrency(convertedRevenue)}
                  </Typography>
                </Paper>

                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    bgcolor: '#081e31',
                    '&:hover': { bgcolor: '#0a2740' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Send Recovery Emails
                </Button>
              </Stack>
            </CardContent>
          </Card>
          )}
        </Grid>
      </Grid>

      {/* Traffic Sources, Revenue by Category & Recent Orders */}
      <Grid container spacing={3}>
        {/* Traffic Sources */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {loading ? (
            <ListSkeleton items={4} />
          ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Traffic Sources</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Where visitors come from
              </Typography>
              <Stack spacing={3}>
                {trafficSources.map((source, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: source.color + '20', width: 32, height: 32 }}>
                          <SearchIcon sx={{ color: source.color, fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight="600">{source.source}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {source.visitors.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {source.percentage}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={source.percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: source.color,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
          )}
        </Grid>

        {/* Revenue by Category */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {loading ? (
            <ListSkeleton items={5} />
          ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Revenue by Category</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Product distribution
              </Typography>
              <Stack spacing={3}>
                {categoryRevenue.map((cat, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600">{cat.category}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(cat.revenue)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={cat.percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: cat.color,
                          borderRadius: 4
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {cat.units} units
                      </Typography>
                      <Typography variant="caption" fontWeight="600">
                        {cat.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
          )}
        </Grid>

        {/* Recent Orders */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Recent Orders</Typography>
                  <Typography variant="body2" color="text.secondary">Latest transactions</Typography>
                </Box>
                <Button size="small" sx={{ color: '#081e31', textTransform: 'none', fontWeight: 600 }}>
                  View all
                </Button>
              </Box>
              <Stack spacing={2}>
                {recentOrdersDisplay.map((order) => (
                  <Paper key={order.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="600">{order.order_number}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.customer}</Typography>
                      </Box>
                      <Chip 
                        label={order.status} 
                        size="small" 
                        color={getStatusColor(order.status) as any}
                        sx={{ fontSize: 10, fontWeight: 600 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{order.email}</Typography>
                      <Typography variant="body2" fontWeight="bold">{formatCurrency(order.amount)}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {order.date ? new Date(order.date).toLocaleString() : '—'}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
