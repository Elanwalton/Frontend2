"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon, FileDownload as ExportIcon, Send as SendIcon } from '@mui/icons-material';
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '@/components/admin';
import { apiGet } from '@/utils/apiClient';
import { getApiBaseUrl } from '@/utils/apiUrl';

interface Quote {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  product?: string;
  quantity?: number;
  estimatedValue?: number;
  status: string;
  requestDate: string;
  validUntil: string;
  file_path?: string;
}

export default function QuotesPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [metricsData, setMetricsData] = useState({
    total_quotes: 0,
    pending_quotes: 0,
    conversion_rate: 0,
    total_value: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Primary source: quotations table (customer + solar quotes)
        const res = await apiGet<{ success: boolean; data: any[] }>('/getQuote');
        const rows: Quote[] = (res?.data || []).map((q: any) => ({
          id: String(q.quote_number || q.id),
          customer: String(q.customer_name || ''),
          email: String(q.customer_email || ''),
          status: 'generated',
          requestDate: String(q.created_at || ''),
          validUntil: '',
          file_path: q.file_path || '',
        }));
        setQuotes(rows);

        // Basic metrics based on what we have
        const total = rows.length;
        setMetricsData({
          total_quotes: total,
          pending_quotes: 0,
          conversion_rate: 0,
          total_value: 0,
        });
      } catch {
        // Fallback source: legacy quote_requests admin endpoint
        const res = await apiGet<any>('/admin/getQuotes');
        const rows: Quote[] = (res?.data || []).map((q: any) => ({
          id: String(q.quote_number || q.id),
          customer: String(q.customer || q.customer_name || ''),
          email: String(q.email || q.customer_email || ''),
          phone: q.phone || q.customer_phone || '',
          product: q.description || '',
          quantity: undefined,
          estimatedValue: typeof q.estimated_value === 'number' ? q.estimated_value : undefined,
          status: String(q.status || 'pending'),
          requestDate: String(q.date || q.created_at || ''),
          validUntil: String(q.valid_until || ''),
          file_path: q.file_path || '',
        }));
        setQuotes(rows);
        setMetricsData({
          total_quotes: res?.metrics?.total_quotes ?? rows.length,
          pending_quotes: res?.metrics?.pending_quotes ?? 0,
          conversion_rate: res?.metrics?.conversion_rate ?? 0,
          total_value: res?.metrics?.total_value ?? 0,
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const metrics = [
    {
      title: 'Quote Requests',
      value: String(metricsData.total_quotes),
      change: '',
      trend: 'up' as const,
      period: 'This month',
      sparklineData: [metricsData.total_quotes],
      color: '#3b82f6'
    },
    {
      title: 'Pending Quotes',
      value: String(metricsData.pending_quotes),
      change: '',
      trend: 'up' as const,
      period: 'Awaiting response',
      sparklineData: [metricsData.pending_quotes],
      color: '#f59e0b'
    },
    {
      title: 'Conversion Rate',
      value: `${metricsData.conversion_rate}%`,
      change: '',
      trend: 'up' as const,
      period: 'Quote to order',
      sparklineData: [metricsData.conversion_rate],
      color: '#10b981'
    },
    {
      title: 'Total Value',
      value: `KES ${metricsData.total_value.toLocaleString()}`,
      change: '',
      trend: 'up' as const,
      period: 'Active quotes',
      sparklineData: [metricsData.total_value],
      color: '#8b5cf6'
    },
  ];

  const backendOrigin = getApiBaseUrl().replace(/\/api\/?$/, '');

  const columns: Column[] = [
    { id: 'id', label: 'Quote ID', minWidth: 110 },
    { id: 'customer', label: 'Customer', minWidth: 140 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'phone', label: 'Phone', minWidth: 130 },
    { id: 'product', label: 'Product', minWidth: 200 },
    {
      id: 'quantity',
      label: 'Qty',
      minWidth: 70,
      align: 'center',
    },
    {
      id: 'estimatedValue',
      label: 'Est. Value',
      minWidth: 120,
      align: 'right',
      format: (value) => value ? `KES ${Number(value).toLocaleString()}` : '-',
    },
    { id: 'requestDate', label: 'Request Date', minWidth: 120 },
    { id: 'validUntil', label: 'Valid Until', minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'file_path',
      label: 'PDF',
      minWidth: 90,
      format: (value, row: any) => {
        const path = row?.file_path || value;
        if (!path) return '-';
        return (
          <a
            href={`${backendOrigin}/${String(path).replace(/^\/+/, '')}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
          >
            Download
          </a>
        );
      },
    },
  ];

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customer.toLowerCase().includes(search.toLowerCase()) ||
                         quote.id.toLowerCase().includes(search.toLowerCase()) ||
                         quote.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendQuote = (quote: Quote) => {
    console.log('Send quote:', quote);
  };

  return (
    <Box>
      <PageHeader
        title="Quote Requests"
        subtitle="Manage customer quote requests and proposals"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Quotes' },
        ]}
        action={{
          label: 'Create Quote',
          onClick: () => console.log('Create new quote'),
          icon: <SendIcon />,
        }}
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
          placeholder="Search quotes..."
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
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" startIcon={<ExportIcon />}>
          Export
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredQuotes}
        onEdit={(quote) => handleSendQuote(quote)}
        onView={(quote) => console.log('View', quote)}
        onDelete={(quote) => console.log('Delete', quote)}
        loading={loading}
      />
    </Box>
  );
}
