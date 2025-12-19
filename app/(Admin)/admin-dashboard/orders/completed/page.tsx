"use client";

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiUrl';
import { Box, Grid, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material';
import { Search as SearchIcon, FileDownload as ExportIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '../../components/admin';
import { 
  Clock as ClockIcon, 
  Package as PackageIcon, 
  CheckCircle as CheckCircleIcon, 
  Truck as TruckIcon,
  User as UserIcon
} from 'lucide-react';
import styles from '../../../styles/adminDashboard.module.css';

interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: string;
  date: string;
  completedDate: string;
  items: number;
  rating?: number;
}

export default function CompletedOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [search, dateFilter, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        status: 'completed',
        search: search,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      
      const response = await fetch(`${getApiUrl('/api/admin/getOrders')}?${params}`, {
        credentials: 'include',
        headers: {}
      });
      const data = await response.json();
      
      if (data.success) {
        const transformedOrders = data.data.map((order: any) => ({
          id: order.order_number,
          customer: order.customer,
          email: order.email,
          product: `${order.items} items`,
          amount: order.amount,
          status: order.status,
          date: new Date(order.date).toISOString().split('T')[0],
          completedDate: new Date(order.updated_at).toISOString().split('T')[0],
          items: order.items,
          rating: 4 // Default rating since API doesn't provide it
        }));
        
        setOrders(transformedOrders);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch completed orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount);

  const metrics = [
    {
      title: 'Completed Orders',
      value: pagination.total.toString(),
      change: '+18%',
      trend: 'up' as const,
      period: 'Total completed',
      sparklineData: [120, 125, 130, 135, 140, 142, 145, 148, 152, pagination.total],
      color: '#10b981'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(orders.reduce((sum, order) => sum + order.amount, 0)),
      change: '+22%',
      trend: 'up' as const,
      period: 'Completed orders',
      sparklineData: [65000, 68000, 71000, 74000, 77000, 78000, 80000, 81000, 83000, orders.reduce((sum, order) => sum + order.amount, 0)],
      color: '#3b82f6'
    },
    {
      title: 'Avg. Order Value',
      value: orders.length > 0 ? formatCurrency(Math.round(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length)) : 'KSh 0',
      change: '+0.2',
      trend: 'up' as const,
      period: 'Current batch',
      sparklineData: [450, 460, 470, 480, 490, 500, 510, 520, 530, orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length) : 0],
      color: '#f59e0b'
    },
    {
      title: 'Items Delivered',
      value: orders.reduce((sum, order) => sum + order.items, 0).toString(),
      change: '+15%',
      trend: 'up' as const,
      period: 'Total items',
      sparklineData: [180, 190, 200, 210, 220, 230, 240, 250, 260, orders.reduce((sum, order) => sum + order.items, 0)],
      color: '#8b5cf6'
    },
  ];

  const columns: Column[] = [
    { id: 'id', label: 'Order ID', minWidth: 120 },
    { 
      id: 'customer', 
      label: 'Customer', 
      minWidth: 150,
      format: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={16} style={{ color: '#666' }} />
          {value}
        </div>
      )
    },
    { id: 'product', label: 'Product', minWidth: 200 },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(value),
    },
    { id: 'date', label: 'Order Date', minWidth: 120 },
    { id: 'completedDate', label: 'Completed', minWidth: 120 },
    {
      id: 'rating',
      label: 'Rating',
      minWidth: 100,
      align: 'center',
      format: (value) => value ? `⭐ ${value}/5` : 'No rating',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
        <span 
          className={styles.statusBadge}
          style={{ 
            backgroundColor: `${getStatusColor(value)}15`,
            color: getStatusColor(value),
            borderColor: `${getStatusColor(value)}30` 
          }}
        >
          {getStatusIcon(value)}
          {value}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    console.log('Exporting completed orders...');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactElement> = {
      pending: <ClockIcon size={14} />,
      processing: <PackageIcon size={14} />,
      shipped: <TruckIcon size={14} />,
      delivered: <CheckCircleIcon size={14} />,
      cancelled: <ClockIcon size={14} />
    };
    return icons[status] || <ClockIcon size={14} />;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(search.toLowerCase()) ||
                         order.id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box sx={{ pt: 6 }}>
      <PageHeader
        title="Completed Orders"
        subtitle="View and manage completed customer orders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Orders', href: '/admin-dashboard/orders' },
          { label: 'Completed' },
        ]}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <MetricCard {...metric} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateFilter}
            label="Date Range"
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
        >
          Export
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredOrders}
        onView={(order) => console.log('View', order)}
        loading={loading}
      />
    </Box>
  );
}
