"use client";

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiUrl';
import { Box, Grid, Button, TextField, InputAdornment, Snackbar, Alert } from '@mui/material';
import { Search as SearchIcon, FileDownload as ExportIcon, LocalShipping as TrackIcon } from '@mui/icons-material';
import { PageHeader, DataTable, MetricCard, Column, OrderDetailsModal, OrderEditModal } from '@/components/admin';
import { 
  Clock as ClockIcon, 
  Package as PackageIcon, 
  CheckCircle as CheckCircleIcon, 
  Truck as TruckIcon,
  User as UserIcon
} from 'lucide-react';
import styles from '@/styles/adminDashboard.module.css';

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  shippedDate: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  items: number;
}

export default function ShippedOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editOrderDetails, setEditOrderDetails] = useState<any | null>(null);
  const [editOrderNumber, setEditOrderNumber] = useState<string | null>(null);
  const [actionPendingByOrder, setActionPendingByOrder] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({
    open: false,
    severity: 'info',
    message: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [search, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        status: 'shipped',
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
          product: `${order.items} items`,
          amount: order.amount,
          status: order.status,
          shippedDate: new Date(order.updated_at).toISOString().split('T')[0],
          trackingNumber: order.tracking_number || 'N/A',
          carrier: order.carrier || 'Standard',
          estimatedDelivery: order.estimated_delivery || 'N/A',
          items: order.items
        }));
        
        setOrders(transformedOrders);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch shipped orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrderEdits = async (payload: { status: string; shipping_address?: string | null; tracking_number?: string | null; carrier?: string | null }) => {
    if (!editOrderNumber) return;
    const res = await fetch(getApiUrl('/api/admin/updateOrderStatus'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ order_number: editOrderNumber, ...payload }),
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || 'Failed to update order');
    }
  };

  const handleEdit = (order: Order) => {
    withPending(order.id, async () => {
      try {
        setEditOrderNumber(order.id);
        const res = await fetch(`${getApiUrl('/api/admin/getOrderDetails')}?order_number=${encodeURIComponent(order.id)}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load order details');
        }
        setEditOrderDetails(json.order);
        setEditOpen(true);
      } catch (e) {
        setSnackbar({ open: true, severity: 'error', message: e instanceof Error ? e.message : 'Failed to open edit' });
      }
    });
  };

  const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount);

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

  const metrics = [
    {
      title: 'Shipped Orders',
      value: pagination.total.toString(),
      change: '+8%',
      trend: 'up' as const,
      period: 'In transit',
      sparklineData: [28, 29, 30, 31, 32, 31, 33, 34, 34, pagination.total],
      color: '#3b82f6'
    },
    {
      title: 'Total Value',
      value: formatCurrency(orders.reduce((sum, order) => sum + order.amount, 0)),
      change: '+12%',
      trend: 'up' as const,
      period: 'Shipped orders',
      sparklineData: [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, orders.reduce((sum, order) => sum + order.amount, 0)],
      color: '#10b981'
    },
    {
      title: 'Avg. Order Value',
      value: orders.length > 0 ? formatCurrency(Math.round(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length)) : 'KSh 0',
      change: '-0.5',
      trend: 'down' as const,
      period: 'Current batch',
      sparklineData: [420, 400, 380, 370, 360, 350, 340, 330, 320, orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length) : 0],
      color: '#8b5cf6'
    },
    {
      title: 'Items in Transit',
      value: orders.reduce((sum, order) => sum + order.items, 0).toString(),
      change: '+15%',
      trend: 'up' as const,
      period: 'Total items',
      sparklineData: [68, 69, 70, 71, 72, 71, 73, 74, 74, orders.reduce((sum, order) => sum + order.items, 0)],
      color: '#f59e0b'
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
    { id: 'shippedDate', label: 'Shipped Date', minWidth: 120 },
    { id: 'estimatedDelivery', label: 'Est. Delivery', minWidth: 120 },
    { id: 'carrier', label: 'Carrier', minWidth: 100 },
    { id: 'trackingNumber', label: 'Tracking #', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${getStatusColor(value)}15`,
              border: `1px solid ${getStatusColor(value)}30`,
              color: getStatusColor(value),
            }}
          >
            {getStatusIcon(value)}
          </Box>
          <Box
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              color: getStatusColor(value),
            }}
          >
            {String(value)}
          </Box>
        </Box>
      ),
    },
  ];

  const handleExport = () => {
    const header = ['order_number', 'customer', 'items', 'amount', 'status', 'shipped_date', 'tracking_number', 'carrier', 'estimated_delivery'];
    const rows = filteredOrders.map((o) => [o.id, o.customer, o.items, o.amount, o.status, o.shippedDate, o.trackingNumber, o.carrier, o.estimatedDelivery]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/\"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipped-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const withPending = async (orderNumber: string, fn: () => Promise<void>) => {
    if (actionPendingByOrder[orderNumber]) return;
    setActionPendingByOrder((prev) => ({ ...prev, [orderNumber]: true }));
    try {
      await fn();
    } finally {
      setActionPendingByOrder((prev) => ({ ...prev, [orderNumber]: false }));
    }
  };

  const handleView = (order: Order) => {
    withPending(order.id, async () => {
      try {
        const res = await fetch(`${getApiUrl('/api/admin/getOrderDetails')}?order_number=${encodeURIComponent(order.id)}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load order details');
        }
        setOrderDetails(json.order);
        setOrderItems(json.items || []);
        setDetailsOpen(true);
      } catch (e) {
        setSnackbar({ open: true, severity: 'error', message: e instanceof Error ? e.message : 'Failed to load order details' });
      }
    });
  };

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.trackingNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ pt: 6 }}>
      <OrderDetailsModal
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setOrderDetails(null);
          setOrderItems([]);
        }}
        order={orderDetails}
        items={orderItems}
      />

      <OrderEditModal
        open={editOpen}
        onClose={() => {
          if (editSaving) return;
          setEditOpen(false);
          setEditOrderNumber(null);
          setEditOrderDetails(null);
        }}
        order={editOrderDetails}
        saving={editSaving}
        onSave={(payload) => {
          if (!editOrderNumber) return;
          setEditSaving(true);
          withPending(editOrderNumber, async () => {
            try {
              await saveOrderEdits(payload);
              setSnackbar({ open: true, severity: 'success', message: 'Order updated' });
              setEditOpen(false);
              setEditOrderNumber(null);
              setEditOrderDetails(null);
              await fetchOrders();
            } catch (e) {
              setSnackbar({ open: true, severity: 'error', message: e instanceof Error ? e.message : 'Failed to update order' });
            } finally {
              setEditSaving(false);
            }
          });
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PageHeader
        title="Shipped Orders"
        subtitle="Track orders currently in transit"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Orders', href: '/admin-dashboard/orders' },
          { label: 'Shipped' },
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
          placeholder="Search by order, customer, or tracking..."
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

        <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport}>
          Export
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredOrders}
        onEdit={handleEdit}
        onView={handleView}
        loading={loading}
      />
    </Box>
  );
}
