"use client";

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiUrl';
import { Box, Grid, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, FileDownload as ExportIcon, HourglassEmpty as PendingIcon } from '@mui/icons-material';
import { PageHeader, DataTable, MetricCard, Column, OrderDetailsModal, OrderEditModal, ConfirmDialog } from '@/components/admin';
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
  email: string;
  product: string;
  amount: number;
  status: string;
  date: string;
  items: number;
}

export default function PendingOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editOrderNumber, setEditOrderNumber] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editOrderDetails, setEditOrderDetails] = useState<any | null>(null);
  const [actionPendingByOrder, setActionPendingByOrder] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({
    open: false,
    severity: 'info',
    message: ''
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'delete' | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        status: 'pending',
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
      console.error('Failed to fetch orders:', error);
      // Keep existing orders on error
    } finally {
      setLoading(false);
    }
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

  const loadOrderDetails = async (orderNumber: string) => {
    const res = await fetch(`${getApiUrl('/api/admin/getOrderDetails')}?order_number=${encodeURIComponent(orderNumber)}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || 'Failed to load order details');
    }
    setOrderDetails(json.order);
    setOrderItems(json.items || []);
  };

  const updateStatus = async (orderNumber: string, status: string) => {
    const res = await fetch(getApiUrl('/api/admin/updateOrderStatus'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ order_number: orderNumber, status }),
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || 'Failed to update status');
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

  const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount);

  const metrics = [
    {
      title: 'Pending Orders',
      value: pagination.total.toString(),
      change: '+5%',
      trend: 'up' as const,
      period: 'Total pending',
      sparklineData: [18, 19, 17, 20, 21, 19, 22, 23, 24, pagination.total],
      color: '#f59e0b'
    },
    {
      title: 'Total Value',
      value: formatCurrency(orders.reduce((sum, order) => sum + order.amount, 0)),
      change: '+12%',
      trend: 'up' as const,
      period: 'Pending orders',
      sparklineData: [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, orders.reduce((sum, order) => sum + order.amount, 0)],
      color: '#10b981'
    },
    {
      title: 'Avg. Order Value',
      value: orders.length > 0 ? formatCurrency(Math.round(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length)) : 'KSh 0',
      change: '+3%',
      trend: 'up' as const,
      period: 'Current batch',
      sparklineData: [480, 490, 500, 510, 520, 515, 525, 530, 535, orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length) : 0],
      color: '#3b82f6'
    },
    {
      title: 'Items Count',
      value: orders.reduce((sum, order) => sum + order.items, 0).toString(),
      change: '+8%',
      trend: 'up' as const,
      period: 'Total items',
      sparklineData: [28, 29, 30, 31, 32, 31, 33, 34, 34, orders.reduce((sum, order) => sum + order.items, 0)],
      color: '#8b5cf6'
    },
  ];

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
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'product', label: 'Product', minWidth: 200 },
    {
      id: 'items',
      label: 'Items',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(value),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
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
    { id: 'date', label: 'Date', minWidth: 120 },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(search.toLowerCase()) ||
                         order.id.toLowerCase().includes(search.toLowerCase()) ||
                         order.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleDelete = (order: Order) => {
    setConfirmOrder(order);
    setConfirmAction('cancel');
    setConfirmOpen(true);
  };

  const handleDeleteRecord = (order: Order) => {
    setConfirmOrder(order);
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const executeCancel = async (order: Order) => {
    withPending(order.id, async () => {
      try {
        await updateStatus(order.id, 'cancelled');
        setSnackbar({ open: true, severity: 'success', message: 'Order cancelled' });
        await fetchOrders();
      } catch (e) {
        setSnackbar({ open: true, severity: 'error', message: e instanceof Error ? e.message : 'Failed to cancel order' });
      }
    });
  };

  const executeDelete = async (order: Order) => {
    withPending(order.id, async () => {
      try {
        const res = await fetch(`${getApiUrl('/api/admin/deleteOrder')}?order_number=${encodeURIComponent(order.id)}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to delete order');
        }
        setSnackbar({ open: true, severity: 'success', message: 'Order deleted' });
        await fetchOrders();
      } catch (e) {
        setSnackbar({ open: true, severity: 'error', message: e instanceof Error ? e.message : 'Failed to delete order' });
      }
    });
  };

  const handleView = (order: Order) => {
    withPending(order.id, async () => {
      try {
        setSelectedOrderNumber(order.id);
        await loadOrderDetails(order.id);
        setDetailsOpen(true);
      } catch (e) {
        setSnackbar({ open: true, severity: 'error', message: e instanceof Error ? e.message : 'Failed to load order details' });
      }
    });
  };

  const handleExport = () => {
    const header = ['order_number', 'customer', 'email', 'items', 'amount', 'status', 'date'];
    const rows = filteredOrders.map((o) => [o.id, o.customer, o.email, o.items, o.amount, o.status, o.date]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/\"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ pt: 6 }}>
      <OrderDetailsModal
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedOrderNumber(null);
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

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (actionPendingByOrder[confirmOrder?.id ?? '']) return;
          setConfirmOpen(false);
          setConfirmAction(null);
          setConfirmOrder(null);
        }}
        onConfirm={() => {
          if (!confirmOrder || !confirmAction) return;
          setConfirmOpen(false);
          if (confirmAction === 'cancel') {
            executeCancel(confirmOrder);
          } else if (confirmAction === 'delete') {
            executeDelete(confirmOrder);
          }
          setConfirmAction(null);
          setConfirmOrder(null);
        }}
        title={
          confirmAction === 'cancel'
            ? 'Cancel Order'
            : confirmAction === 'delete'
            ? 'Delete Order'
            : 'Confirm Action'
        }
        message={
          confirmAction === 'cancel'
            ? `Are you sure you want to cancel order ${confirmOrder?.id}? This will mark the order as cancelled but keep the record.`
            : confirmAction === 'delete'
            ? `Are you sure you want to permanently delete order ${confirmOrder?.id}? This action cannot be undone.`
            : ''
        }
        confirmText={confirmAction === 'cancel' ? 'Cancel Order' : confirmAction === 'delete' ? 'Delete Order' : 'Confirm'}
        cancelText="Back"
        loading={actionPendingByOrder[confirmOrder?.id ?? ''] || false}
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
        title="Pending Orders"
        subtitle="Manage and process pending customer orders"
        icon={<PendingIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Orders', href: '/admin-dashboard/orders' },
          { label: 'Pending' },
        ]}
      />

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <MetricCard {...metric} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
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
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredOrders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteRecord={handleDeleteRecord}
        onView={handleView}
        deleteLabel="Cancel"
        deleteIcon="cancel"
        selectable
        loading={loading}
      />
    </Box>
  );
}

