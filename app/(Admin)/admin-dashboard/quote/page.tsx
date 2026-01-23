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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  MetricCard,
  Column,
  QuoteEditorModal,
  SendQuoteModal,
  RequestDetailsModal,
} from '@/components/admin';
import { apiGet } from '@/utils/apiClient';
import { getApiBaseUrl } from '@/utils/apiUrl';

interface QuoteRequest {
  id: number;
  request_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  appliances: string;
  status: string;
  ai_quote_id: string | null;
  has_ai_quote: boolean;
  created_at: string;
  is_ai_generated?: boolean;
  reviewed_by?: number | null;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
  file_path?: string;
  is_ai_generated?: boolean;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
}

export default function QuotesPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0); // 0 = Requests, 1 = Generated Quotes
  
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [metricsData, setMetricsData] = useState({
    total_requests: 0,
    pending_requests: 0,
    total_quotes: 0,
    ai_generated: 0,
  });

  // Modal states
  const [editorModal, setEditorModal] = useState<{
    open: boolean;
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
  }>({ open: false, quoteNumber: '', customerName: '', customerEmail: '' });

  const [sendModal, setSendModal] = useState<{
    open: boolean;
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  }>({ open: false, quoteNumber: '', customerName: '', customerEmail: '', customerPhone: '' });

  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    request: QuoteRequest | null;
  }>({ open: false, request: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load quote requests
      const requestsRes = await apiGet<{ success: boolean; data: any[] }>('/admin/getQuoteRequests');
      const requestsData: QuoteRequest[] = (requestsRes?.data || []).map((r: any) => ({
        id: r.id,
        request_number: r.request_number,
        customer_name: r.customer_name,
        customer_email: r.customer_email,
        customer_phone: r.customer_phone || '',
        appliances: r.appliances || '',
        status: r.status,
        ai_quote_id: r.ai_quote_id,
        has_ai_quote: r.has_ai_quote || false,
        created_at: r.created_at,
        is_ai_generated: r.is_ai_generated || false,
        reviewed_by: r.reviewed_by,
      }));
      setRequests(requestsData);

      // Load generated quotes
      const quotesRes = await apiGet<{ success: boolean; data: any[] }>('/getQuote');
      const quotesData: Quote[] = (quotesRes?.data || []).map((q: any) => ({
        id: String(q.quote_number || q.id),
        quote_number: String(q.quote_number || q.id),
        customer_name: String(q.customer_name || ''),
        customer_email: String(q.customer_email || ''),
        status: q.status || 'generated',
        created_at: String(q.created_at || ''),
        file_path: q.file_path || '',
        is_ai_generated: q.is_ai_generated || false,
        reviewed_by: q.reviewed_by,
        reviewed_at: q.reviewed_at,
      }));
      setQuotes(quotesData);

      // Calculate metrics
      const pendingRequests = requestsData.filter(r => r.status === 'pending').length;
      const aiGenerated = quotesData.filter(q => q.is_ai_generated).length;
      
      setMetricsData({
        total_requests: requestsData.length,
        pending_requests: pendingRequests,
        total_quotes: quotesData.length,
        ai_generated: aiGenerated,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Quote Requests',
      value: String(metricsData.total_requests),
      change: '',
      trend: 'up' as const,
      period: 'Total submissions',
      sparklineData: [metricsData.total_requests],
      color: '#3b82f6'
    },
    {
      title: 'Pending Requests',
      value: String(metricsData.pending_requests),
      change: '',
      trend: 'up' as const,
      period: 'Awaiting review',
      sparklineData: [metricsData.pending_requests],
      color: '#f59e0b'
    },
    {
      title: 'Generated Quotes',
      value: String(metricsData.total_quotes),
      change: '',
      trend: 'up' as const,
      period: 'All quotes',
      sparklineData: [metricsData.total_quotes],
      color: '#10b981'
    },
    {
      title: 'AI Generated',
      value: String(metricsData.ai_generated),
      change: '',
      trend: 'up' as const,
      period: 'Automated quotes',
      sparklineData: [metricsData.ai_generated],
      color: '#8b5cf6'
    },
  ];

  const backendOrigin = getApiBaseUrl().replace(/\/api\/?$/, '');

  // Columns for Quote Requests tab
  const requestColumns: Column[] = [
    { id: 'request_number', label: 'Request #', minWidth: 130 },
    { id: 'customer_name', label: 'Customer', minWidth: 140 },
    { id: 'customer_email', label: 'Email', minWidth: 180 },
    {
      id: 'appliances',
      label: 'Appliances',
      minWidth: 200,
      format: (value) => {
        const text = String(value || '');
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
      },
    },
    {
      id: 'has_ai_quote',
      label: 'AI Quote',
      minWidth: 100,
      align: 'center',
      format: (value) => value ? (
        <Chip label="Generated" size="small" color="success" icon={<AIIcon />} />
      ) : (
        <Chip label="Pending" size="small" variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => <StatusBadge status={value} />,
    },
    { id: 'created_at', label: 'Submitted', minWidth: 120 },
  ];

  // Columns for Generated Quotes tab
  const quoteColumns: Column[] = [
    { id: 'quote_number', label: 'Quote #', minWidth: 130 },
    { id: 'customer_name', label: 'Customer', minWidth: 140 },
    { id: 'customer_email', label: 'Email', minWidth: 180 },
    {
      id: 'is_ai_generated',
      label: 'Type',
      minWidth: 100,
      align: 'center',
      format: (value) => value ? (
        <Chip label="AI" size="small" color="primary" icon={<AIIcon />} />
      ) : (
        <Chip label="Manual" size="small" icon={<PersonIcon />} variant="outlined" />
      ),
    },
    {
      id: 'reviewed_by',
      label: 'Reviewed',
      minWidth: 100,
      align: 'center',
      format: (value) => value ? (
        <Chip label="Yes" size="small" color="success" />
      ) : (
        <Chip label="No" size="small" variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => <StatusBadge status={value} />,
    },
    { id: 'created_at', label: 'Created', minWidth: 120 },
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

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                         req.request_number.toLowerCase().includes(search.toLowerCase()) ||
                         req.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                         quote.quote_number.toLowerCase().includes(search.toLowerCase()) ||
                         quote.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (request: QuoteRequest) => {
    setDetailsModal({ open: true, request });
  };

  const handleEditQuote = (quote: any) => {
    // Debug logging
    console.log('handleEditQuote called with:', quote);
    alert('Edit handler triggered! ID: ' + (quote?.quote_number || quote?.ai_quote_id || 'NEW')); 

    // Robustly extract quote ID from either quote_number (generated quotes) or ai_quote_id (requests)
    const quoteNumber = quote?.quote_number || quote?.ai_quote_id || '';
    const customerName = quote?.customer_name || '';
    const customerEmail = quote?.customer_email || '';
    
    // alert(`Opening editor for: ${customerName} (ID: ${quoteNumber})`);

    setEditorModal({
      open: true,
      quoteNumber,
      customerName,
      customerEmail,
    });
  };

  const handleCreateQuote = () => {
    setEditorModal({
      open: true,
      quoteNumber: '',
      customerName: '',
      customerEmail: '',
    });
  };

  const handleSendQuote = (quote: Quote) => {
    setSendModal({
      open: true,
      quoteNumber: quote.quote_number,
      customerName: quote.customer_name,
      customerEmail: quote.customer_email,
      customerPhone: '', // Will be fetched from quote details if available
    });
  };

  return (
    <Box>
      <PageHeader
        title="Quote Management"
        subtitle="Manage customer quote requests and generated quotes"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Quotes' },
        ]}
        action={{
          label: 'Create Quote',
          onClick: handleCreateQuote,
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label={`Requests (${requests.length})`} />
          <Tab label={`Generated Quotes (${quotes.length})`} />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search..."
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
            <MenuItem value="reviewed">Reviewed</MenuItem>
            <MenuItem value="quoted">Quoted</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" startIcon={<ExportIcon />}>
          Export
        </Button>
      </Box>

      {activeTab === 0 && (
        <DataTable
          columns={requestColumns}
          rows={filteredRequests}
          onView={(req) => handleViewRequest(req)}
          onEdit={(req) => handleEditQuote(req as any)}
          loading={loading}
        />
      )}

      {activeTab === 1 && (
        <DataTable
          columns={quoteColumns}
          rows={filteredQuotes}
          onEdit={(quote) => handleEditQuote(quote)}
          onView={(quote) => handleSendQuote(quote)}
          loading={loading}
        />
      )}

      {/* Modals */}
      <QuoteEditorModal
        open={editorModal.open}
        onClose={() => setEditorModal({ ...editorModal, open: false })}
        quoteNumber={editorModal.quoteNumber}
        customerName={editorModal.customerName}
        customerEmail={editorModal.customerEmail}
        onSave={() => loadData()}
      />

      <SendQuoteModal
        open={sendModal.open}
        onClose={() => setSendModal({ ...sendModal, open: false })}
        quoteNumber={sendModal.quoteNumber}
        customerName={sendModal.customerName}
        customerEmail={sendModal.customerEmail}
        customerPhone={sendModal.customerPhone}
        onSuccess={() => loadData()}
      />

      <RequestDetailsModal
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, request: null })}
        request={detailsModal.request}
        onEditQuote={(quoteId) => {
          const quote = quotes.find(q => q.quote_number === quoteId);
          if (quote) handleEditQuote(quote);
        }}
      />
    </Box>
  );
}
