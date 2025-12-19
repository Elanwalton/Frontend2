'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Grid, 
  Button, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Chip,
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
  Typography
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
  CalendarToday as CalendarIcon,
  AttachMoney as DollarSignIcon,
  Group as UsersIcon,
  Inventory as PackageIcon
} from '@mui/icons-material';
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '@/components/admin';
import { 
  Edit as EditLucideIcon, 
  Eye as EyeLucideIcon, 
  Send as SendLucideIcon, 
  CheckCircle as CheckCircleLucideIcon, 
  XCircle as XCircleLucideIcon, 
  Clock as ClockLucideIcon 
} from 'lucide-react';
import styles from './quotes.module.css';

interface Quote {
  id: string;
  quoteNumber: string;
  client: {
    name: string;
    email: string;
    company: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  createdDate: string;
  expiryDate: string;
  validityDays: number;
  notes?: string;
}

// Sample quotes data adapted for Sunleaf Technologies
const sampleQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QT-2024-001',
    client: {
      name: 'John Kamau',
      email: 'john@example.com',
      company: 'TechCorp Ltd'
    },
    items: [
      { name: '200W Solar Panel', quantity: 10, price: 15000 },
      { name: 'Solar Inverter 5KW', quantity: 2, price: 45000 }
    ],
    subtotal: 240000,
    tax: 38400,
    total: 278400,
    status: 'sent',
    createdDate: '2024-01-15',
    expiryDate: '2024-02-14',
    validityDays: 30,
    notes: 'Bulk order discount applied'
  },
  {
    id: '2',
    quoteNumber: 'QT-2024-002',
    client: {
      name: 'Mary Wanjiku',
      email: 'mary@example.com',
      company: 'GreenEnergy Co'
    },
    items: [
      { name: 'Solar Power Bank 20000mAh', quantity: 50, price: 4500 }
    ],
    subtotal: 225000,
    tax: 36000,
    total: 261000,
    status: 'accepted',
    createdDate: '2024-01-10',
    expiryDate: '2024-02-09',
    validityDays: 30
  },
  {
    id: '3',
    quoteNumber: 'QT-2024-003',
    client: {
      name: 'David Omondi',
      email: 'david@example.com',
      company: 'PowerSolutions'
    },
    items: [
      { name: 'LED Flood Light 150W', quantity: 20, price: 3500 }
    ],
    subtotal: 70000,
    tax: 11200,
    total: 81200,
    status: 'viewed',
    createdDate: '2024-01-08',
    expiryDate: '2024-02-07',
    validityDays: 30
  },
  {
    id: '4',
    quoteNumber: 'QT-2024-004',
    client: {
      name: 'Sarah Njeri',
      email: 'sarah@example.com',
      company: 'BuildTech'
    },
    items: [
      { name: 'Garden Light 250W', quantity: 15, price: 5500 }
    ],
    subtotal: 82500,
    tax: 13200,
    total: 95700,
    status: 'draft',
    createdDate: '2024-01-05',
    expiryDate: '2024-02-04',
    validityDays: 30
  },
  {
    id: '5',
    quoteNumber: 'QT-2023-058',
    client: {
      name: 'James Mwangi',
      email: 'james@example.com',
      company: 'Solar Innovations'
    },
    items: [
      { name: 'Gel Battery 12V', quantity: 8, price: 35000 }
    ],
    subtotal: 280000,
    tax: 44800,
    total: 324800,
    status: 'expired',
    createdDate: '2023-12-20',
    expiryDate: '2024-01-19',
    validityDays: 30
  }
];

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>(sampleQuotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'client'>('date');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Calculate statistics
  const stats = {
    total: quotes.length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    revenue: quotes
      .reduce((sum, q) => sum + q.total, 0)
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
      draft: '#6b7280',
      sent: '#3b82f6',
      viewed: '#f59e0b',
      accepted: '#10b981',
      rejected: '#ef4444',
      expired: '#9ca3af'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Quote['status']) => {
    const icons = {
      draft: <EditLucideIcon size={14} />,
      sent: <SendLucideIcon size={14} />,
      viewed: <EyeLucideIcon size={14} />,
      accepted: <CheckCircleLucideIcon size={14} />,
      rejected: <XCircleLucideIcon size={14} />,
      expired: <ClockLucideIcon size={14} />
    };
    return icons[status];
  };

  const handleExportCSV = () => {
    // CSV export logic
    console.log('Exporting CSV...');
  };

  const handleSendEmail = (quoteId: string) => {
    // Email sending logic
    console.log('Sending email for quote:', quoteId);
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

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
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
  ];

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
            value={stats.sent.toString()}
            change="Requires attention"
            trend="down"
            period="Current"
            color="#ef4444"
            sparklineData={[12, 15, 18, 14, 20, 16, 22, 19, 25, stats.sent]}
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
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="viewed">Viewed</MenuItem>
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
        >
          New Quote
        </Button>
      </Box>

      {/* Quotes Table */}
      <Box sx={{ mt: 3 }}>
        <DataTable
          data={sortedQuotes || []}
          columns={columns}
          loading={false}
        />
      </Box>
    </Box>
  );
}
