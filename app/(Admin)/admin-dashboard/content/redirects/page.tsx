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
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Link as LinkIcon,
  Assessment as ChartIcon,
  CheckCircle as ActiveIcon,
  PauseCircle as InactiveIcon,
} from '@mui/icons-material';
import { PageHeader, DataTable, MetricCard, Column } from '@/components/admin';
import { ArrowRight, Globe, MousePointerClick } from 'lucide-react';
import styles from '@/styles/adminDashboard.module.css';
import { getApiEndpoint } from '@/utils/apiClient';

interface Redirect {
  id: string;
  old_url: string;
  new_url: string;
  redirect_type: '301' | '302' | '307';
  status: 'active' | 'inactive';
  hit_count: number;
  last_accessed: string | null;
  notes: string;
  created_at: string;
}

export default function RedirectsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<Redirect[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    old_url: '',
    new_url: '',
    redirect_type: '301',
    status: 'active',
    notes: ''
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [redirectToDelete, setRedirectToDelete] = useState<Redirect | null>(null);

  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchRedirects();
  }, [page, search]);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search })
      });

      const response = await fetch(`${getApiEndpoint('/admin/redirects')}?${params}`, {
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.data.items || []);
        setTotalPages(data.data.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching redirects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (redirect?: Redirect) => {
    if (redirect) {
      setIsEditing(true);
      setFormData({
        id: redirect.id,
        old_url: redirect.old_url,
        new_url: redirect.new_url,
        redirect_type: redirect.redirect_type,
        status: redirect.status,
        notes: redirect.notes || ''
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: '',
        old_url: '',
        new_url: '',
        redirect_type: '301',
        status: 'active',
        notes: ''
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiEndpoint('/admin/redirects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          open: true,
          message: isEditing ? 'Redirect updated successfully' : 'Redirect created successfully',
          severity: 'success'
        });
        setModalOpen(false);
        fetchRedirects();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.message || 'Failed to save redirect',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!redirectToDelete) return;
    try {
      const response = await fetch(`${getApiEndpoint('/admin/redirects')}?id=${redirectToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          open: true,
          message: 'Redirect deleted successfully',
          severity: 'success'
        });
        setDeleteConfirmOpen(false);
        fetchRedirects();
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete redirect',
        severity: 'error'
      });
    }
  };

  const columns: Column[] = [
    { 
      id: 'old_url', 
      label: 'Source URL', 
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
          {value}
        </Typography>
      )
    },
    { id: 'divider', label: '', minWidth: 40, format: () => <ArrowRight size={16} /> },
    { 
      id: 'new_url', 
      label: 'Target URL', 
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
          {value}
        </Typography>
      )
    },
    { 
      id: 'redirect_type', 
      label: 'Type', 
      minWidth: 80,
      format: (value) => <Chip label={value} size="small" variant="outlined" />
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={value === 'active' ? 'success' : 'default'}
          icon={value === 'active' ? <ActiveIcon /> : <InactiveIcon />}
        />
      ),
    },
    { 
      id: 'hit_count', 
      label: 'Hits', 
      minWidth: 80,
      align: 'right',
      format: (value) => value.toLocaleString()
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      format: (_, row) => (
        <Box display="flex" gap={1} justifyContent="center">
          <IconButton size="small" color="primary" onClick={() => handleOpenModal(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => {
            setRedirectToDelete(row);
            setDeleteConfirmOpen(true);
          }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const metrics = [
    {
      title: 'Total Redirects',
      value: items.length.toString(),
      trend: 'up' as const,
      period: 'Active rules',
      icon: <LinkIcon />,
      color: '#3b82f6'
    },
    {
      title: 'Total Traffic',
      value: items.reduce((acc, curr) => acc + (curr.hit_count || 0), 0).toLocaleString(),
      trend: 'up' as const,
      period: 'Cumulative clicks',
      icon: <MousePointerClick />,
      color: '#10b981'
    },
    {
      title: 'Active Rules',
      value: items.filter(i => i.status === 'active').length.toString(),
      trend: 'up' as const,
      period: 'Live now',
      icon: <Globe />,
      color: '#6366f1'
    }
  ];

  return (
    <Box>
      <PageHeader
        title="URL Redirects"
        subtitle="Manage 301, 302, and 307 SEO redirects"
        icon={<LinkIcon sx={{ fontSize: 32 }} />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin-dashboard' },
          { label: 'Content' },
          { label: 'Redirects' },
        ]}
        action={{
          label: "New Redirect",
          onClick: () => handleOpenModal(),
          icon: <AddIcon />,
          variant: "contained"
        }}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 4 }} key={index}>
            <MetricCard {...metric} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search redirects by URL or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        rows={items}
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

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Redirect' : 'Add New Redirect'}</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <Alert severity="info" sx={{ mb: 1 }}>
                Redirects help preserve SEO juice when moving pages.
              </Alert>
              
              <TextField
                label="Source Path (Old URL)"
                placeholder="/old-slug"
                required
                fullWidth
                value={formData.old_url}
                onChange={(e) => setFormData({ ...formData, old_url: e.target.value })}
                helperText="Must start with /"
              />

              <TextField
                label="Target Path/URL (New URL)"
                placeholder="/new-slug or https://external.com"
                required
                fullWidth
                value={formData.new_url}
                onChange={(e) => setFormData({ ...formData, new_url: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Redirect Type</InputLabel>
                    <Select
                      value={formData.redirect_type}
                      label="Redirect Type"
                      onChange={(e) => setFormData({ ...formData, redirect_type: e.target.value as any })}
                    >
                      <MenuItem value="301">301 (Permanent)</MenuItem>
                      <MenuItem value="302">302 (Found/Temporary)</MenuItem>
                      <MenuItem value="307">307 (Temporary)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                label="Notes"
                placeholder="Why is this redirect being created?"
                multiline
                rows={2}
                fullWidth
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Redirect</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the redirect from <strong>{redirectToDelete?.old_url}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
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
