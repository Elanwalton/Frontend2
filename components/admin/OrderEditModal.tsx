'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | string;

type OrderDetails = {
  order_number: string;
  status: OrderStatus;
  shipping_address?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
};

export default function OrderEditModal({
  open,
  onClose,
  order,
  saving,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  saving: boolean;
  onSave: (payload: { status: string; shipping_address?: string | null; tracking_number?: string | null; carrier?: string | null }) => void;
}) {
  const currentStatus = String(order?.status || '').toLowerCase();

  const nextStatusOptions = useMemo(() => {
    if (!currentStatus) return [];
    if (currentStatus === 'pending') return ['processing'];
    if (currentStatus === 'processing') return ['shipped'];
    if (currentStatus === 'shipped') return ['delivered'];
    return [];
  }, [currentStatus]);

  const [status, setStatus] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  useEffect(() => {
    setStatus(nextStatusOptions[0] || '');
    setShippingAddress(order?.shipping_address || '');
    setTrackingNumber(order?.tracking_number || '');
    setCarrier(order?.carrier || '');
  }, [order, nextStatusOptions]);

  const canEditTracking = status === 'shipped' || status === 'delivered';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit / Process Order</DialogTitle>
      <DialogContent dividers>
        {!order ? (
          <Typography variant="body2" color="text.secondary">
            No order selected.
          </Typography>
        ) : (
          <>
            <Typography variant="subtitle2">Order</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {order.order_number} (current: {String(order.status)})
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Next Status"
                  fullWidth
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving || nextStatusOptions.length === 0}
                  helperText={
                    nextStatusOptions.length === 0
                      ? 'No further status actions available for this order.'
                      : 'Select the next step in the workflow.'
                  }
                >
                  {nextStatusOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Shipping Address"
                  fullWidth
                  multiline
                  minRows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  disabled={saving}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Carrier"
                  fullWidth
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  disabled={saving || !canEditTracking}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Tracking Number"
                  fullWidth
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  disabled={saving || !canEditTracking}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            onSave({
              status,
              shipping_address: shippingAddress,
              tracking_number: trackingNumber,
              carrier,
            })
          }
          disabled={saving || !order || !status}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
