"use client"

import * as React from "react"
import { getApiUrl } from '@/utils/apiUrl'
import {
  Box,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '@/components/admin';

export type Payment = {
  id: string
  transactionId: string
  merchantRequestId?: string
  orderId?: number
  userId?: number
  amount: number
  currency: string
  method: "Mpesa" | "PayPal" | "Card" | "Bank Transfer" | "Cash on Delivery"
  status: "pending" | "processing" | "success" | "failed" | "refunded"
  resultCode?: string
  resultDesc?: string
  mpesaReceiptNumber?: string
  email: string
  customerName?: string
  phoneNumber?: string
  processedAt?: string
  transactionDate?: string
  date: string
  createdAt: string
  updatedAt: string
}

type Order = "asc" | "desc";

export default function PaymentsTable() {
  const [data, setData] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterMethod, setFilterMethod] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  React.useEffect(() => {
    fetchPayments();
  }, [search, filterMethod, filterStatus, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        search: search,
        payment_method: filterMethod,
        status: filterStatus,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      
      const response = await fetch(`${getApiUrl('/api/admin/getPayments')}?${params}`, {
        credentials: 'include',
        headers: {}
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setData(result.data || []);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || 0,
          pages: result.pagination?.pages || 0
        }));
      } else {
        console.error('Failed to fetch payments:', result.error || result.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const totalAmount = data.reduce((sum, p) => sum + p.amount, 0);
    const successCount = data.filter(p => p.status === 'success').length;
    const successAmount = data.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    const avgAmount = data.length > 0 ? totalAmount / data.length : 0;
    
    return [
      {
        title: 'Total Payment Volume',
        value: formatCurrency(totalAmount),
        change: '+23%',
        trend: 'up' as const,
        period: 'All time (all statuses)',
        sparklineData: [5000, 5500, 6000, 6200, 6800, 7200, 7500, 7800, 8000, totalAmount],
        color: '#10b981'
      },
      {
        title: 'Revenue (Successful)',
        value: formatCurrency(successAmount),
        change: `+${successCount}`,
        trend: 'up' as const,
        period: 'Completed payments only',
        sparklineData: [4000, 4300, 4600, 4800, 5200, 5600, 5900, 6200, 6400, successAmount],
        color: '#3b82f6'
      },
      {
        title: 'Pending Payments',
        value: data.filter(p => p.status === 'pending').length.toString(),
        change: 'Awaiting confirmation',
        trend: 'neutral' as const,
        period: 'Current',
        sparklineData: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        color: '#f59e0b'
      },
      {
        title: 'Avg. Transaction',
        value: formatCurrency(avgAmount),
        change: '+8%',
        trend: 'up' as const,
        period: 'Per payment',
        sparklineData: [1000, 1100, 1200, 1250, 1300, 1350, 1400, 1450, 1500, avgAmount],
        color: '#8b5cf6'
      }
    ];
  }, [data]);

  // Define columns for DataTable
  const columns: Column[] = [
    { id: 'transactionId', label: 'Transaction ID', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'customerName', label: 'Customer Name', minWidth: 150 },
    { id: 'method', label: 'Method', minWidth: 120 },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      align: 'right',
      format: (value) => formatCurrency(value as number),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => <StatusBadge status={value as string} />,
    },
    { id: 'mpesaReceiptNumber', label: 'Receipt', minWidth: 120 },
    { id: 'date', label: 'Date', minWidth: 120 },
  ];

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  }
  
  // Filter data
  const filteredData = React.useMemo(() => {
    return data.filter((payment) => {
      const matchesSearch = payment.email.toLowerCase().includes(search.toLowerCase()) ||
                           payment.transactionId.toLowerCase().includes(search.toLowerCase()) ||
                           (payment.customerName && payment.customerName.toLowerCase().includes(search.toLowerCase()));
      const matchesMethod = filterMethod ? payment.method === filterMethod : true;
      const matchesStatus = filterStatus ? payment.status === filterStatus : true;
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [data, search, filterMethod, filterStatus]);

  const handleEdit = (payment: Payment) => {
    console.log('Edit payment:', payment);
  };

  const handleDelete = (payment: Payment) => {
    console.log('Delete payment:', payment);
  };

  const handleView = (payment: Payment) => {
    console.log('View payment:', payment);
  };

  const handleExport = () => {
    console.log('Export payments');
  };

  return (
    <Box sx={{ pt: 6 }}>
      <PageHeader
        title="Payment Management"
        subtitle="Track, manage, and analyze all payment transactions"
        icon={<PaymentIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Payments' },
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
          placeholder="Search payments..."
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
          <InputLabel>Method</InputLabel>
          <Select
            value={filterMethod}
            label="Method"
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <MenuItem value="">All Methods</MenuItem>
            <MenuItem value="Mpesa">Mpesa</MenuItem>
            <MenuItem value="PayPal">PayPal</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
          <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
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
        rows={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        selectable
        loading={loading}
        pagination={pagination}
        onPageChange={(newPage: number) => setPagination(prev => ({ ...prev, page: newPage }))}
      />
    </Box>
  )
}
