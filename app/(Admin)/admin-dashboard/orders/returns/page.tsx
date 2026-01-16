"use client";

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiUrl';
import { Box, Grid, Button, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { Search as SearchIcon, FileDownload as ExportIcon } from '@mui/icons-material';
import { PageHeader, DataTable, StatusBadge, MetricCard, Column, OrderDetailsModal } from '@/components/admin';

interface Return {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  amount: number;
  reason: string;
  status: string;
  requestDate: string;
  refundStatus: string;
}

export default function ReturnsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [returns, setReturns] = useState<Return[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
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
    fetchReturns();
  }, [search, statusFilter, pagination.page]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        status: 'returned',
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
        const transformedReturns = data.data.map((order: any) => ({
          id: `RET-${order.id}`,
          orderId: order.order_number,
          customer: order.customer,
          product: `${order.items} items`,
          amount: order.amount,
          reason: 'Customer request', // Default since API doesn't provide return reason
          status: 'pending', // Default return status
          requestDate: new Date(order.updated_at).toISOString().split('T')[0],
          refundStatus: order.payment_status === 'refunded' ? 'processed' : 'pending'
        }));
        
        setReturns(transformedReturns);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error);
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
      title: 'Return Requests',
      value: pagination.total.toString(),
      change: '-8%',
      trend: 'down' as const,
      period: 'Total returns',
      sparklineData: [18, 17, 16, 15, 14, 13, 13, 12, 12, pagination.total],
      color: '#f59e0b'
    },
    {
      title: 'Total Refund Amount',
      value: formatCurrency(returns.reduce((sum, ret) => sum + ret.amount, 0)),
      change: '-12%',
      trend: 'down' as const,
      period: 'Refund value',
      sparklineData: [7200, 7000, 6800, 6500, 6200, 6000, 5800, 5600, 5500, returns.reduce((sum, ret) => sum + ret.amount, 0)],
      color: '#ef4444'
    },
    {
      title: 'Avg. Return Value',
      value: returns.length > 0 ? formatCurrency(Math.round(returns.reduce((sum, ret) => sum + ret.amount, 0) / returns.length)) : 'KSh 0',
      change: '-0.5%',
      trend: 'down' as const,
      period: 'Average return',
      sparklineData: [450, 440, 430, 420, 410, 400, 390, 380, 370, returns.length > 0 ? Math.round(returns.reduce((sum, ret) => sum + ret.amount, 0) / returns.length) : 0],
      color: '#3b82f6'
    },
    {
      title: 'Items Returned',
      value: returns.reduce((sum, ret) => sum + (ret as any).items || 1, 0).toString(),
      change: '-15%',
      trend: 'down' as const,
      period: 'Total items',
      sparklineData: [28, 27, 26, 25, 24, 23, 22, 21, 20, returns.reduce((sum, ret) => sum + (ret as any).items || 1, 0)],
      color: '#8b5cf6'
    },
  ];

  const columns: Column[] = [
    { id: 'id', label: 'Return ID', minWidth: 120 },
    { id: 'orderId', label: 'Order ID', minWidth: 120 },
    { id: 'customer', label: 'Customer', minWidth: 150 },
    { id: 'product', label: 'Product', minWidth: 200 },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(value),
    },
    { id: 'reason', label: 'Reason', minWidth: 150 },
    { id: 'requestDate', label: 'Request Date', minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'refundStatus',
      label: 'Refund',
      minWidth: 100,
      format: (value) => <StatusBadge status={value} />,
    },
  ];

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.customer.toLowerCase().includes(search.toLowerCase()) ||
                         ret.id.toLowerCase().includes(search.toLowerCase()) ||
                         ret.orderId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const withPending = async (orderNumber: string, fn: () => Promise<void>) => {
    if (actionPendingByOrder[orderNumber]) return;
    setActionPendingByOrder((prev) => ({ ...prev, [orderNumber]: true }));
    try {
      await fn();
    } finally {
      setActionPendingByOrder((prev) => ({ ...prev, [orderNumber]: false }));
    }
  };

  const handleView = (ret: Return) => {
    withPending(ret.orderId, async () => {
      try {
        const res = await fetch(`${getApiUrl('/api/admin/getOrderDetails')}?order_number=${encodeURIComponent(ret.orderId)}`, {
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

  const handleEdit = (ret: Return) => {
    // Return workflows are not implemented in backend yet.
    setSnackbar({ open: true, severity: 'info', message: 'Return processing actions are not implemented yet.' });
  };

  const handleExport = () => {
    const header = ['return_id', 'order_number', 'customer', 'amount', 'reason', 'status', 'refund_status', 'request_date'];
    const rows = filteredReturns.map((r) => [r.id, r.orderId, r.customer, r.amount, r.reason, r.status, r.refundStatus, r.requestDate]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/\"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `returns-${new Date().toISOString().slice(0, 10)}.csv`;
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
          setOrderDetails(null);
          setOrderItems([]);
        }}
        order={orderDetails}
        items={orderItems}
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
        title="Returns & Refunds"
        subtitle="Manage product returns and refund requests"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Orders', href: '/admin-dashboard/orders' },
          { label: 'Returns' },
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
          placeholder="Search returns..."
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
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExport}>
          Export
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredReturns}
        onEdit={handleEdit}
        onView={handleView}
        loading={loading}
      />
    </Box>
  );
}
