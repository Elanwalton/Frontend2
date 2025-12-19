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
  Rating,
  Avatar,
  Typography,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  Snackbar,
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as ApproveIcon, Block as RejectIcon, Star as StarIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { PageHeader, DataTable, StatusBadge, MetricCard, Column } from '../../components/admin';
import { 
  Clock as ClockIcon, 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon,
  Package as PackageIcon
} from 'lucide-react';
import styles from '../../../styles/adminDashboard.module.css';
import { getApiEndpoint } from '../../utils/apiClient';

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  date_submitted: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_purchase: boolean;
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
        ...(search && { search })
      });

      const response = await fetch(`${getApiEndpoint('/admin/reviews')}?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to mock data for now
      setReviews([
        {
          id: 'REV-001',
          product_id: '1',
          product_name: 'Solar Panel 400W',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          rating: 5,
          review_text: 'Excellent product! Works great and easy to install. The installation process was straightforward and the performance has been outstanding.',
          date_submitted: '2024-11-08',
          status: 'pending',
          verified_purchase: true
        },
        {
          id: 'REV-002',
          product_id: '2',
          product_name: 'LiFePO4 Battery 5kWh',
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          rating: 4,
          review_text: 'Good battery, but shipping took longer than expected. Otherwise, the quality is excellent.',
          date_submitted: '2024-11-07',
          status: 'approved',
          verified_purchase: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Total Reviews',
      value: reviews.length.toString(),
      change: '+15%',
      trend: 'up' as const,
      period: 'All time',
      sparklineData: [1000, 1050, 1100, 1120, 1150, 1170, 1190, 1210, 1220, 1234],
      color: '#3b82f6'
    },
    {
      title: 'Avg. Rating',
      value: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
      change: '+0.2',
      trend: 'up' as const,
      period: 'Overall',
      sparklineData: [4.3, 4.4, 4.4, 4.5, 4.5, 4.5, 4.6, 4.6, 4.6, 4.6],
      color: '#f59e0b'
    },
    {
      title: 'Pending Reviews',
      value: reviews.filter(r => r.status === 'pending').length.toString(),
      change: '+5',
      trend: 'up' as const,
      period: 'Awaiting moderation',
      sparklineData: [15, 16, 17, 18, 19, 20, 21, 22, 23, 23],
      color: '#ef4444'
    },
    {
      title: 'Response Rate',
      value: '87%',
      change: '+3%',
      trend: 'up' as const,
      period: 'This month',
      sparklineData: [80, 81, 82, 83, 84, 85, 85, 86, 87, 87],
      color: '#10b981'
    },
  ];

  const columns: Column[] = [
    { id: 'product_name', label: 'Product', minWidth: 180 },
    { 
      id: 'customer_name', 
      label: 'Reviewer', 
      minWidth: 150,
      format: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{row.customer_email}</Typography>
        </Box>
      )
    },
    {
      id: 'rating',
      label: 'Rating',
      minWidth: 120,
      format: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Rating value={value} readOnly size="small" />
          <Typography variant="body2">({value})</Typography>
        </Box>
      ),
    },
    { 
      id: 'review_text', 
      label: 'Review', 
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: '250px'
        }}>
          {value}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (value) => (
        <Chip
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          size="small"
          color={value === 'approved' ? 'success' : value === 'rejected' ? 'error' : 'warning'}
          variant="outlined"
        />
      ),
    },
    { 
      id: 'date_submitted', 
      label: 'Date', 
      minWidth: 100,
      format: (value) => new Date(value).toLocaleDateString()
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center',
      format: (_, row) => (
        <Box display="flex" gap={1} justifyContent="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => handleViewReview(row)}
          >
            View
          </Button>
          {row.status === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleApproveAction(row)}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleRejectAction(row)}
              >
                Reject
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setViewModalOpen(true);
  };

  const handleApproveAction = (review: Review) => {
    setSelectedReview(review);
    setActionType('approve');
    setConfirmDialogOpen(true);
  };

  const handleRejectAction = (review: Review) => {
    setSelectedReview(review);
    setActionType('reject');
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedReview || !actionType) return;

    try {
      const response = await fetch(getApiEndpoint('/admin/reviews/update-status'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          review_id: selectedReview.id,
          status: actionType === 'approve' ? 'approved' : 'rejected'
        })
      });

      if (!response.ok) throw new Error('Failed to update review');

      // Update local state
      setReviews(reviews.map(r => 
        r.id === selectedReview.id 
          ? { ...r, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : r
      ));

      setNotification({
        open: true,
        message: `Review ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to ${actionType} review`,
        severity: 'error'
      });
    } finally {
      setConfirmDialogOpen(false);
      setSelectedReview(null);
      setActionType(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      approved: '#34c759',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <Box>
      <PageHeader
        title="Product Reviews"
        subtitle="Manage and moderate customer reviews"
        icon={<StarIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Products' },
          { label: 'Reviews' },
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
          placeholder="Search by product, reviewer, or review text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Rating</InputLabel>
          <Select
            value={ratingFilter}
            label="Rating"
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <MenuItem value="all">All Ratings</MenuItem>
            <MenuItem value="5">5 Stars</MenuItem>
            <MenuItem value="4">4 Stars</MenuItem>
            <MenuItem value="3">3 Stars</MenuItem>
            <MenuItem value="2">2 Stars</MenuItem>
            <MenuItem value="1">1 Star</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataTable
        columns={columns}
        rows={reviews}
        loading={loading}
      />

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* View Review Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Product</Typography>
                  <Typography variant="body1" fontWeight={500}>{selectedReview.product_name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Reviewer</Typography>
                  <Typography variant="body1">{selectedReview.customer_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedReview.customer_email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Rating</Typography>
                  <Rating value={selectedReview.rating} readOnly />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{new Date(selectedReview.date_submitted).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Review</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedReview.review_text}</Typography>
              
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                <Chip
                  label={selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                  color={selectedReview.status === 'approved' ? 'success' : selectedReview.status === 'rejected' ? 'error' : 'warning'}
                  variant="outlined"
                />
                {selectedReview.verified_purchase && (
                  <Chip label="Verified Purchase" color="primary" variant="outlined" size="small" />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          {selectedReview?.status === 'pending' && (
            <>
              <Button onClick={() => {
                setViewModalOpen(false);
                handleApproveAction(selectedReview);
              }} color="success">
                Approve
              </Button>
              <Button onClick={() => {
                setViewModalOpen(false);
                handleRejectAction(selectedReview);
              }} color="error">
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} this review by {selectedReview?.customer_name}?
          </Typography>
          {selectedReview && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Product:</strong> {selectedReview.product_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Rating:</strong> <Rating value={selectedReview.rating} readOnly size="small" />
              </Typography>
              <Typography variant="body2">
                <strong>Review:</strong> {selectedReview.review_text.substring(0, 100)}...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmAction} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
