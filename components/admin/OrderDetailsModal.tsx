'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Chip,
} from '@mui/material';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | string;

type OrderDetails = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: string | null;
  billing_address?: string | null;
  subtotal?: number;
  tax?: number;
  shipping_cost?: number;
  discount?: number;
  total_amount?: number;
  status: OrderStatus | string;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  notes?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export default function OrderDetailsModal({
  open,
  onClose,
  order,
  items,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderDetails | null;
  items: OrderItem[];
}) {
  const formatMoney = (amount: any) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(num);
  };

  const statusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'warning';
    if (s === 'processing') return 'info';
    if (s === 'shipped') return 'secondary';
    if (s === 'delivered' || s === 'completed') return 'success';
    if (s === 'cancelled' || s === 'refunded') return 'error';
    return 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Order Details
        {order?.order_number ? (
          <Box sx={{ mt: 1 }}>
            <Chip label={order.order_number} size="small" sx={{ mr: 1 }} />
            <Chip label={String(order.status)} size="small" color={statusColor(String(order.status)) as any} />
          </Box>
        ) : null}
      </DialogTitle>
      <DialogContent dividers>
        {!order ? (
          <Typography variant="body2" color="text.secondary">
            No order selected.
          </Typography>
        ) : (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Customer</Typography>
                <Typography variant="body2">{order.customer_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customer_email}
                </Typography>
                {order.customer_phone ? (
                  <Typography variant="body2" color="text.secondary">
                    {order.customer_phone}
                  </Typography>
                ) : null}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Payment</Typography>
                <Typography variant="body2">Status: {order.payment_status}</Typography>
                {order.payment_method ? (
                  <Typography variant="body2" color="text.secondary">
                    Method: {order.payment_method}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Shipping</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shipping_address || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carrier: {order.carrier || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tracking: {order.tracking_number || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ETA: {order.estimated_delivery || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Totals</Typography>
                <Typography variant="body2">Subtotal: {formatMoney(order.subtotal)}</Typography>
                <Typography variant="body2">Tax: {formatMoney(order.tax)}</Typography>
                <Typography variant="body2">Shipping: {formatMoney(order.shipping_cost)}</Typography>
                <Typography variant="body2">Discount: {formatMoney(order.discount)}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total: {formatMoney(order.total_amount)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Items
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Unit</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        No items.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.product_name}</TableCell>
                      <TableCell>{it.product_sku || '—'}</TableCell>
                      <TableCell align="right">{it.quantity}</TableCell>
                      <TableCell align="right">{formatMoney(it.unit_price)}</TableCell>
                      <TableCell align="right">{formatMoney(it.total_price)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {order.notes ? (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Notes</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.notes}
                </Typography>
              </>
            ) : null}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
