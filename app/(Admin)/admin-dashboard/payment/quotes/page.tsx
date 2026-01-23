'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Grid, 
  Button, 
  TextField, 
  InputAdornment, 
  Select, 
  FormControl, 
  InputLabel,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  Description as FileTextIcon,
  MoreVert as MoreVerticalIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  Error as AlertCircleIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  Delete as Trash2Icon,
  Autorenew as RefreshIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as DollarSignIcon,
  Group as UsersIcon,
  Inventory as PackageIcon
} from '@mui/icons-material';
import { PageHeader, DataTable, StatusBadge, MetricCard, Column, QuoteEditorModal } from '@/components/admin';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminErrorState from '@/components/admin/AdminErrorState';
import { 
  Edit as EditLucideIcon, 
  Eye as EyeLucideIcon, 
  Send as SendLucideIcon, 
  CheckCircle as CheckCircleLucideIcon, 
  XCircle as XCircleLucideIcon, 
  Clock as ClockLucideIcon 
} from 'lucide-react';
import styles from './quotes.module.css';
import { apiCall, apiGet } from '@/utils/apiClient';
import { getApiEndpoint } from '@/utils/apiClient';
import QuotationResult from '@/components/SolarQuotationTool/QuotationResult';
import type { SolarQuoteResult } from '@/components/SolarQuotationTool/types';
import { getApiBaseUrl } from '@/utils/apiUrl';
import CreateQuoteModal from '@/components/QuoteModal';

interface Quote {
  id: string;
  quoteNumber: string;
  client: {
    name: string;
    email: string;
    company: string;
  };
  file_path?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'rejected';
  createdDate: string;
  expiryDate?: string;
  validityDays?: number;
  notes?: string;
}

type SendQuoteResult = {
  success: boolean;
  data?: {
    quote_number: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    file_path?: string;
  };
  message?: string;
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'client'>('date');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewData, setViewData] = useState<SolarQuoteResult | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );

  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [statusMenuQuote, setStatusMenuQuote] = useState<Quote | null>(null);

  const [editorModal, setEditorModal] = useState({
    open: false,
    quoteNumber: '',
    clientName: '',
    clientEmail: '',
  });

  const apiBaseUrl = getApiBaseUrl().replace(/\/+$/, '');

  const buildPdfUrl = (filePath?: string) => {
    if (!filePath) return '';
    // file_path is stored relative to the PHP backend (typically under /api/quotes/...)
    // so we build the URL off the API base.
    const normalized = String(filePath).replace(/^\/+/, '').replace(/^api\//i, '');
    return `${apiBaseUrl}/${normalized}`;
  };

  const loadQuotes = async () => {
    try {
      setPageLoading(true);
      // Primary: quotations table (includes solar quotes)
      const res = await apiGet<{ success: boolean; data: any[] }>('/getQuote');
      const rows: Quote[] = (res?.data || []).map((q: any) => ({
        id: String(q.quote_number || q.id),
        quoteNumber: String(q.quote_number || q.id),
        client: {
          name: String(q.customer_name || ''),
          email: String(q.customer_email || ''),
          company: '',
        },
        file_path: q.file_path || '',
        items: Array.isArray(q.items) ? q.items : [],
        subtotal: typeof q.subtotal === 'number' ? q.subtotal : 0,
        tax: typeof q.tax === 'number' ? q.tax : 0,
        total: typeof q.total === 'number' ? q.total : 0,
        status: (q.status as any) || 'pending',
        createdDate: String(q.created_at || ''),
        expiryDate: q.expiry_date || '',
        validityDays: 0,
      }));
      setQuotes(rows);
    } catch (err: any) {
      console.warn('Primary quote fetch failed:', err);
      // Fallback: legacy quote_requests admin endpoint
      const res = await apiGet<any>('/admin/getQuotes');
      const rows: Quote[] = (res?.data || []).map((q: any) => ({
        id: String(q.quote_number || q.id),
        quoteNumber: String(q.quote_number || q.id),
        client: {
          name: String(q.customer || q.customer_name || ''),
          email: String(q.email || q.customer_email || ''),
          company: String(q.company || q.company_name || ''),
        },
        file_path: q.file_path || '',
        items: [],
        subtotal: 0,
        tax: 0,
        total: typeof q.estimated_value === 'number' ? q.estimated_value : 0,
        status: (String(q.status || 'sent') as Quote['status']) || 'sent',
        createdDate: String(q.date || q.created_at || ''),
        expiryDate: String(q.valid_until || ''),
        validityDays: 0,
        notes: q.notes || undefined,
      }));
      setQuotes(rows);
    } finally {
      setPageLoading(false);
    }
  };

  const handleDownload = async (row: Quote) => {
    // Prefer using already-loaded PDF path
    const url = buildPdfUrl(row.file_path);
    if (!url) {
      // Resolve via details endpoint (includes file_path)
      try {
        const res = await apiGet<{ success: boolean; data: SolarQuoteResult }>(
          `/admin/getQuotationDetails?quote_number=${encodeURIComponent(row.quoteNumber)}`
        );
        const resolved = buildPdfUrl(res?.data?.file_path);
        if (resolved) window.open(resolved, '_blank', 'noreferrer');
      } catch {
        // ignore
      }
      return;
    }
    window.open(url, '_blank', 'noreferrer');
  };

  const handleShare = async (row: Quote) => {
    let url = buildPdfUrl(row.file_path);
    if (!url) {
      try {
        const res = await apiGet<{ success: boolean; data: SolarQuoteResult }>(
          `/admin/getQuotationDetails?quote_number=${encodeURIComponent(row.quoteNumber)}`
        );
        url = buildPdfUrl(res?.data?.file_path);
      } catch {
        // ignore
      }
    }

    const text = url || row.quoteNumber;
    const title = `Quote ${row.quoteNumber}`;

    try {
      if (url && typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as any).share({ title, text: url, url });

        try {
          await apiCall('/updateQuoteStatus', {
            method: 'POST',
            body: JSON.stringify({ quote_number: row.quoteNumber, status: 'sent' }),
          });
          setQuotes(prev => prev.map(q => (q.quoteNumber === row.quoteNumber ? { ...q, status: 'sent' } : q)));
        } catch {
          // ignore
        }

        return;
      }
    } catch {
      // fall back to clipboard
    }

    try {
      await navigator.clipboard.writeText(text);

      try {
        await apiCall('/updateQuoteStatus', {
          method: 'POST',
          body: JSON.stringify({ quote_number: row.quoteNumber, status: 'sent' }),
        });
        setQuotes(prev => prev.map(q => (q.quoteNumber === row.quoteNumber ? { ...q, status: 'sent' } : q)));
      } catch {
        // ignore
      }
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      try {
        await apiCall('/updateQuoteStatus', {
          method: 'POST',
          body: JSON.stringify({ quote_number: row.quoteNumber, status: 'sent' }),
        });
        setQuotes(prev => prev.map(q => (q.quoteNumber === row.quoteNumber ? { ...q, status: 'sent' } : q)));
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    void loadQuotes();
  }, []);

  // Calculate statistics
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    revenue: quotes.reduce((sum, q) => sum + (q.total || 0), 0)
  };

  // Filter quotes
  const filteredQuotes = (quotes || []).filter(quote => {
    const matchesSearch = searchTerm === '' || 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || quote.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      case 'amount':
        return b.total - a.total;
      case 'client':
        return a.client.name.localeCompare(b.client.name);
      default:
        return 0;
    }
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedQuotes(sortedQuotes.map(q => q.id));
    } else {
      setSelectedQuotes([]);
    }
  };

  const handleSelectQuote = (id: string) => {
    setSelectedQuotes(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: Quote['status']) => {
    const colors = {
      pending: '#f59e0b',
      sent: '#0ea5e9',
      accepted: '#10b981',
      rejected: '#ef4444',
      expired: '#9ca3af'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: Quote['status']) => {
    const icons = {
      pending: <ClockLucideIcon size={14} />,
      sent: <SendLucideIcon size={14} />,
      accepted: <CheckCircleLucideIcon size={14} />,
      rejected: <XCircleLucideIcon size={14} />,
      expired: <ClockLucideIcon size={14} />
    };
    return icons[status] || <ClockLucideIcon size={14} />;
  };

  const handleExportCSV = () => {
    // CSV export logic
    console.log('Exporting CSV...');
  };

  const updateQuoteStatus = async (quoteNumber: string, status: Quote['status']) => {
    try {
      await apiCall('/updateQuoteStatus', {
        method: 'POST',
        body: JSON.stringify({ quote_number: quoteNumber, status }),
      });
      setQuotes(prev => prev.map(q => (q.quoteNumber === quoteNumber ? { ...q, status } : q)));
    } catch {
      // ignore
    }
  };

  const handleSend = async (row: Quote, channel: 'whatsapp' | 'email') => {
    try {
      const res = await apiCall<SendQuoteResult>('/admin/sendQuote', {
        method: 'POST',
        body: JSON.stringify({ quote_number: row.quoteNumber, channel }),
      });

      const contact = res?.data;
      if (!contact) throw new Error(res?.message || 'Failed to prepare send');

      if (channel === 'whatsapp') {
        const phone = String(contact.customer_phone || '').trim();
        if (!phone) throw new Error('Customer phone not available');

        const text = `Quote ${row.quoteNumber}`;
        const waUrl = `https://wa.me/${encodeURIComponent(phone.replace(/\D/g, ''))}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noreferrer');
      }

      if (channel === 'email') {
        const email = String(contact.customer_email || '').trim();
        if (!email) throw new Error('Customer email not available');

        const subject = `Quote ${row.quoteNumber}`;
        const body = `Hello ${contact.customer_name || ''},\n\nPlease find your quote attached/linked: ${buildPdfUrl(contact.file_path || row.file_path)}\n\nRegards`;
        window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }

      await updateQuoteStatus(row.quoteNumber, 'sent');
      setSnackbar({ open: true, severity: 'success', message: `Prepared ${channel} send for ${row.quoteNumber}` });
    } catch (e: any) {
      setSnackbar({ open: true, severity: 'error', message: String(e?.message || 'Failed to send') });
    }
  };

  const handleOpenStatusMenu = (e: React.MouseEvent<HTMLElement>, row: Quote) => {
    e.stopPropagation();
    setStatusMenuAnchorEl(e.currentTarget);
    setStatusMenuQuote(row);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchorEl(null);
    setStatusMenuQuote(null);
  };

  const handleSetStatus = async (status: Quote['status']) => {
    if (!statusMenuQuote) return;
    const quoteNumber = statusMenuQuote.quoteNumber;
    handleCloseStatusMenu();

    try {
      await updateQuoteStatus(quoteNumber, status);
      setSnackbar({ open: true, severity: 'success', message: `Quote ${quoteNumber} updated to ${status}` });
    } catch (e: any) {
      setSnackbar({ open: true, severity: 'error', message: String(e?.message || 'Failed to update status') });
    }
  };

  const handleGeneratePDF = (quoteId: string) => {
    // PDF generation logic
    console.log('Generating PDF for quote:', quoteId);
  };

  const handleConvertToOrder = (quoteId: string) => {
    // Convert to order logic
    console.log('Converting quote to order:', quoteId);
  };

  const handleDuplicateQuote = (quoteId: string) => {
    // Duplicate quote logic
    console.log('Duplicating quote:', quoteId);
  };

  const handleEditQuote = (row: Quote) => {
    console.log('Editing quote:', row);
    setEditorModal({
      open: true,
      quoteNumber: row.quoteNumber,
      clientName: row.client.name,
      clientEmail: row.client.email,
    });
  };

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
  };

  const handleViewQuote = async (row: Quote) => {
    setViewError(null);
    setViewData(null);
    setViewOpen(true);
    setViewLoading(true);
    try {
      const url = getApiEndpoint('/admin/getQuotationDetails') + `?quote_number=${encodeURIComponent(row.quoteNumber)}`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const res = await response.json();
      if (!res.success) {
        throw new Error(res.message || 'Failed to load quote');
      }
      setViewData(res.data);
    } catch (e: any) {
      setViewError(String(e?.message || 'Failed to load quote'));
    } finally {
      setViewLoading(false);
    }
  };

  const columns: Column[] = [
    { id: 'quoteNumber', label: 'Quote Number', minWidth: 120 },
    { 
      id: 'client', 
      label: 'Client', 
      minWidth: 180,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            bgcolor: '#e5e7eb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#6b7280'
          }}>
            {value.name.charAt(0)}
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {value.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {value.company}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            backgroundColor: `${getStatusColor(value)}15`,
            border: `1px solid ${getStatusColor(value)}30`,
            color: getStatusColor(value),
          }}
        >
          {getStatusIcon(value)}
          {String(value)}
        </Box>
      ),
    },
    {
      id: 'total',
      label: 'Total',
      minWidth: 120,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          Ksh {value.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'createdDate',
      label: 'Created',
      minWidth: 120,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon sx={{ fontSize: 14, color: '#666' }} />
          <Typography variant="body2">
            {new Date(value).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'expiryDate',
      label: 'Expiry',
      minWidth: 120,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClockIcon sx={{ fontSize: 14, color: '#666' }} />
          <Typography variant="body2">
            {new Date(value).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      minWidth: 80,
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PackageIcon sx={{ fontSize: 14, color: '#666' }} />
          <Typography variant="body2">
            {value.length} items
          </Typography>
        </Box>
      ),
    },
    {
      id: 'id',
      label: 'Action',
      minWidth: 220,
      format: (_value, row: any) => (
        <>
          <IconButton
            size="small"
            aria-label="More actions"
            id={`quote-actions-button-${String(row.id)}`}
            onClick={(e) => {
              e.stopPropagation();
              setActionMenuAnchorEl(e.currentTarget);
              setShowActionMenu(String(row.id));
            }}
          >
            <MoreVerticalIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={actionMenuAnchorEl}
            open={showActionMenu === String(row.id)}
            onClose={() => {
              setShowActionMenu(null);
              setActionMenuAnchorEl(null);
            }}
            MenuListProps={{
              id: `quote-actions-${String(row.id)}`,
              'aria-labelledby': `quote-actions-button-${String(row.id)}`,
            }}
          >
            <MenuItem
              onClick={() => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                handleViewQuote(row);
              }}
            >
              <EyeIcon sx={{ fontSize: 18, mr: 1 }} />
              View
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                handleDownload(row);
              }}
            >
              <DownloadIcon sx={{ fontSize: 18, mr: 1 }} />
              Download
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                handleShare(row);
              }}
            >
              <SendIcon sx={{ fontSize: 18, mr: 1 }} />
              Share
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                handleOpenStatusMenu(e as any, row);
              }}
            >
              <RefreshIcon sx={{ fontSize: 18, mr: 1 }} />
              Change Status
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                handleEditQuote(row);
              }}
            >
              <EditIcon sx={{ fontSize: 18, mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                void handleSend(row, 'email');
              }}
            >
              <MailIcon sx={{ fontSize: 18, mr: 1 }} />
              Email
            </MenuItem>
            <MenuItem
              sx={{ color: 'error.main' }}
              onClick={() => {
                setShowActionMenu(null);
                setActionMenuAnchorEl(null);
                handleDeleteQuote(String(row.id));
              }}
            >
              <Trash2Icon sx={{ fontSize: 18, mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={statusMenuAnchorEl}
            open={Boolean(statusMenuAnchorEl) && statusMenuQuote?.id === row.id}
            onClose={handleCloseStatusMenu}
          >
            <MenuItem onClick={() => void handleSetStatus('pending')}>
              <ClockIcon sx={{ fontSize: 18, mr: 1 }} />
              Pending
            </MenuItem>
            <MenuItem onClick={() => void handleSetStatus('sent')}>
              <SendIcon sx={{ fontSize: 18, mr: 1 }} />
              Sent
            </MenuItem>
            <MenuItem onClick={() => void handleSetStatus('accepted')}>
              <CheckCircleIcon sx={{ fontSize: 18, mr: 1 }} />
              Accepted
            </MenuItem>
            <MenuItem onClick={() => void handleSetStatus('rejected')}>
              <XCircleIcon sx={{ fontSize: 18, mr: 1 }} />
              Rejected
            </MenuItem>
            <MenuItem onClick={() => void handleSetStatus('expired')}>
              <AlertCircleIcon sx={{ fontSize: 18, mr: 1 }} />
              Expired
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  if (pageLoading) return <LoadingSpinner fullScreen key="quotes-loading" />;
  if (pageError) return <AdminErrorState error={pageError} onRetry={() => loadQuotes()} />;

  return (
    <Box sx={{ pt: 6 }}>
      <PageHeader
        title="Quote Management"
        subtitle="Manage your quote inventory, track status, and monitor performance"
        icon={<FileTextIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Payments', href: '/admin-dashboard/payment' },
          { label: 'Quotes' },
        ]}
      />

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Total Quotes"
            value={stats.total.toString()}
            change="+2.79%"
            trend="up"
            period="All time"
            color="#0ea5e9"
            sparklineData={[45, 52, 48, 55, 58, 62, 68, 72, 78, stats.total]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Pending Quotes"
            value={stats.pending.toString()}
            change="Requires attention"
            trend="down"
            period="Current"
            color="#ef4444"
            sparklineData={[12, 15, 18, 14, 20, 16, 22, 19, 25, stats.pending]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Total Revenue"
            value={`Ksh ${stats.revenue.toLocaleString()}`}
            change="+4.23%"
            trend="up"
            period="All time"
            color="#10b981"
            sparklineData={[45000, 52000, 48000, 61000, 58000, 72000, 68000, 85000, 92000, stats.revenue]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Accepted Quotes"
            value={stats.accepted.toString()}
            change="+1.5%"
            trend="up"
            period="This month"
            color="#8b5cf6"
            sparklineData={[28, 32, 30, 35, 38, 42, 45, 48, 52, stats.accepted]}
          />
        </Grid>
      </Grid>

      {/* Filters & Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search quote..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
        >
          Export
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ 
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            }
          }}
          onClick={() => setCreateOpen(true)}
        >
          New Quote
        </Button>
      </Box>

      {/* Quotes Table */}
      <Box sx={{ mt: 3 }}>
        <DataTable
          rows={sortedQuotes || []}
          columns={columns}
          loading={false}
        />
      </Box>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Quote Preview</DialogTitle>
        <DialogContent>
          {viewLoading ? (
            <Typography variant="body2">Loading...</Typography>
          ) : viewError ? (
            <Typography variant="body2" color="error">
              {viewError}
            </Typography>
          ) : viewData ? (
            <QuotationResult data={viewData} onStartOver={() => setViewOpen(false)} />
          ) : (
            <Typography variant="body2">No data</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {createOpen && (
        <CreateQuoteModal
          onClose={() => setCreateOpen(false)}
          onSuccessMessage={(message) => setSnackbar({ open: true, severity: 'success', message })}
          onQuoteCreated={() => {
            setCreateOpen(false);
            void loadQuotes();
          }}
        />
      )}
      
      {/* Editor Modal */}
      <QuoteEditorModal
        open={editorModal.open}
        onClose={() => setEditorModal({ ...editorModal, open: false })}
        quoteNumber={editorModal.quoteNumber}
        customerName={editorModal.clientName}
        customerEmail={editorModal.clientEmail}
        onSave={() => {
          loadQuotes();
          setSnackbar({ open: true, severity: 'success', message: 'Quote saved successfully' });
        }}
      />
    </Box>
  );
}
