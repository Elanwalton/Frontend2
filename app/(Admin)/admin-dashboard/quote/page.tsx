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

interface Quote {
  id: string;
  customer: string;
  email: string;
  phone: string;
  product: string;
  quantity: number;
  estimatedValue: number;
  status: string;
  requestDate: string;
  validUntil: string;
}

export default function QuotesPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: 'QTE-001',
      customer: 'Michael Brown',
      email: 'michael@example.com',
      phone: '+1234567890',
      product: 'Solar Panel 400W x10',
      quantity: 10,
      estimatedValue: 4200.00,
      status: 'pending',
      requestDate: '2024-11-08',
      validUntil: '2024-11-22'
    },
    {
      id: 'QTE-002',
      customer: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567891',
      product: 'Complete Solar System',
      quantity: 1,
      estimatedValue: 15000.00,
      status: 'sent',
      requestDate: '2024-11-07',
      validUntil: '2024-11-21'
    },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const metrics = [
    {
      title: 'Quote Requests',
      value: '45',
      change: '+12%',
      trend: 'up' as const,
      period: 'This month',
      sparklineData: [35, 36, 38, 39, 40, 41, 42, 43, 44, 45],
      color: '#3b82f6'
    },
    {
      title: 'Pending Quotes',
      value: '18',
      change: '+3',
      trend: 'up' as const,
      period: 'Awaiting response',
      sparklineData: [12, 13, 14, 15, 15, 16, 17, 17, 18, 18],
      color: '#f59e0b'
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      change: '+5%',
      trend: 'up' as const,
      period: 'Quote to order',
      sparklineData: [60, 61, 62, 63, 64, 65, 66, 67, 68, 68],
      color: '#10b981'
    },
    {
      title: 'Total Value',
      value: '$189,500',
      change: '+18%',
      trend: 'up' as const,
      period: 'Active quotes',
      sparklineData: [150000, 155000, 160000, 165000, 170000, 175000, 180000, 183000, 186000, 189500],
      color: '#8b5cf6'
    },
  ];

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
      format: (value) => `$${value.toLocaleString()}`,
    },
    { id: 'requestDate', label: 'Request Date', minWidth: 120 },
    { id: 'validUntil', label: 'Valid Until', minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => <StatusBadge status={value} />,
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
