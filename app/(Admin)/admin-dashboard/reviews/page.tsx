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
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  Snackbar,
  Divider,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CheckCircle as ApproveIcon, 
  Block as RejectIcon, 
  Star as StarIcon, 
  Visibility as ViewIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { PageHeader, DataTable, MetricCard, Column } from '@/components/admin';
import { 
  Clock as ClockIcon, 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import styles from '@/styles/adminDashboard.module.css';
import { getApiEndpoint } from '@/utils/apiClient';

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  pros: string;
  cons: string;
  would_recommend: boolean;
  admin_response: string;
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
  const [paginationData, setPaginationData] = useState<any>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'respond' | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter, ratingFilter, search]);

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
      if (data.success) {
        setReviews(data.reviews || []);
        setTotalPages(data.pagination.totalPages || 1);
        setPaginationData(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Total Reviews',
      value: paginationData?.total.toString() || '0',
      trend: 'up' as const,
      period: 'All time',
      icon: <StarIcon fontSize="small" />,
      color: '#3b82f6'
    },
    {
      title: 'Avg. Rating',
      value: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
      trend: 'up' as const,
      period: 'Overall',
      icon: <CheckCircleIcon />,
      color: '#f59e0b'
    },
    {
      title: 'Pending Reviews',
      value: reviews.filter(r => r.status === 'pending').length.toString(),
      trend: 'up' as const,
      period: 'Awaiting moderation',
      icon: <ClockIcon />,
      color: '#ef4444'
    },
    {
      title: 'Responses',
      value: reviews.filter(r => r.admin_response).length.toString(),
      trend: 'up' as const,
      period: 'Replied by admin',
      icon: <ReplyIcon fontSize="small" />,
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
          <Typography variant="body2" color="text.secondary">({value})</Typography>
        </Box>
      ),
    },
    { 
      id: 'review_text', 
      label: 'Review', 
      minWidth: 250,
      format: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            maxWidth: '250px'
          }}>
            {value}
          </Typography>
          {row.admin_response && (
            <Chip label="Replied" size="small" color="info" variant="outlined" sx={{ height: 16, fontSize: '0.625rem', mt: 0.5 }} />
          )}
        </Box>
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
      minWidth: 180,
      align: 'center',
      format: (_, row) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          <Tooltip title="View Details">
            <IconButton size="small" color="primary" onClick={() => handleViewReview(row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {row.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" sx={{ color: 'success.main' }} onClick={() => handleApproveAction(row)}>
                  <CheckCircleIcon size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => handleRejectAction(row)}>
                  <XCircleIcon size={18} />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          <Tooltip title="Reply">
            <IconButton size="small" sx={{ color: 'info.main' }} onClick={() => handleRespondAction(row)}>
              <ReplyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

  const handleRespondAction = (review: Review) => {
    setSelectedReview(review);
    setAdminResponseText(review.admin_response || '');
    setResponseModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedReview || !actionType) return;
    executeReviewAction(selectedReview.id, actionType);
    setConfirmDialogOpen(false);
  };

  const executeReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'respond', responseBody?: string) => {
    try {
      const response = await fetch(getApiEndpoint('/admin/updateReview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          review_id: reviewId,
          action: action,
          ...(responseBody && { response: responseBody })
        })
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          open: true,
          message: `Review updated successfully`,
          severity: 'success'
        });
        fetchReviews();
        if (selectedReview?.id === reviewId) {
          setSelectedReview(null);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.message || `Failed to ${action} review`,
        severity: 'error'
      });
    }
  };

  const handleSaveResponse = () => {
    if (!selectedReview) return;
    executeReviewAction(selectedReview.id, 'respond', adminResponseText);
    setResponseModalOpen(false);
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Review Details
          <Box>
            {selectedReview?.status === 'pending' && (
              <>
                <Button size="small" color="success" startIcon={<ApproveIcon />} onClick={() => handleApproveAction(selectedReview)} sx={{ mr: 1 }}>
                  Approve
                </Button>
                <Button size="small" color="error" startIcon={<RejectIcon />} onClick={() => handleRejectAction(selectedReview)}>
                  Reject
                </Button>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReview && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="h6" gutterBottom>{selectedReview.product_name}</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Rating value={selectedReview.rating} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(selectedReview.date_submitted).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{selectedReview.review_text}"
                    </Typography>
                  </Paper>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="success.main" display="flex" alignItems="center" gap={1}>
                        <ThumbsUp size={16} /> Pros
                      </Typography>
                      <Typography variant="body2">{selectedReview.pros || 'No pros listed'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" color="error.main" display="flex" alignItems="center" gap={1}>
                        <ClockIcon size={16} /> Cons
                      </Typography>
                      <Typography variant="body2">{selectedReview.cons || 'No cons listed'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Reviewer Information</Typography>
                      <Typography variant="body1" fontWeight={700}>{selectedReview.customer_name}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedReview.customer_email}</Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip 
                          label={selectedReview.status.toUpperCase()} 
                          color={selectedReview.status === 'approved' ? 'success' : selectedReview.status === 'rejected' ? 'error' : 'warning'}
                          size="small"
                        />
                        {selectedReview.verified_purchase && (
                          <Chip label="Verified Purchase" color="primary" icon={<CheckCircleIcon size={14} />} size="small" variant="outlined" />
                        )}
                        {selectedReview.would_recommend && (
                          <Chip label="Recommends Product" color="success" size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {selectedReview.admin_response && (
                <Box sx={{ mt: 3, p: 2, borderLeft: '4px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>Admin Response</Typography>
                  <Typography variant="body2">{selectedReview.admin_response}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleRespondAction(selectedReview!)} color="primary" startIcon={<ReplyIcon />}>
            {selectedReview?.admin_response ? 'Update Response' : 'Reply to Review'}
          </Button>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Response Modal */}
      <Dialog open={responseModalOpen} onClose={() => setResponseModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to {selectedReview?.customer_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your response will be visible publicly under the review.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Thank the customer or address their concerns..."
              value={adminResponseText}
              onChange={(e) => setAdminResponseText(e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveResponse} variant="contained" color="primary">
            Save Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} this review?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmAction} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

