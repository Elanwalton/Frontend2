import React from 'react';
import { Chip } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

const statusConfig: Record<string, { color: any; label: string }> = {
  pending: { color: 'warning', label: 'Pending' },
  processing: { color: 'info', label: 'Processing' },
  completed: { color: 'success', label: 'Completed' },
  cancelled: { color: 'error', label: 'Cancelled' },
  shipped: { color: 'primary', label: 'Shipped' },
  delivered: { color: 'success', label: 'Delivered' },
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  draft: { color: 'default', label: 'Draft' },
  published: { color: 'success', label: 'Published' },
  'out-of-stock': { color: 'error', label: 'Out of Stock' },
  'low-stock': { color: 'warning', label: 'Low Stock' },
  'in-stock': { color: 'success', label: 'In Stock' },
  paid: { color: 'success', label: 'Paid' },
  unpaid: { color: 'error', label: 'Unpaid' },
  refunded: { color: 'default', label: 'Refunded' },
};

export default function StatusBadge({ status, variant = 'filled', size = 'small' }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { color: 'default', label: status };
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={variant}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
}
