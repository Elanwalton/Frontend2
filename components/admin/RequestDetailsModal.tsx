"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { CheckCircle as CheckIcon, Pending as PendingIcon } from '@mui/icons-material';

interface RequestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  request: {
    request_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    appliances: string;
    status: string;
    has_ai_quote: boolean;
    ai_quote_id?: string | null;
    created_at: string;
    analysis_data?: any;
  } | null;
  onEditQuote?: (quoteId: string) => void;
}

export default function RequestDetailsModal({
  open,
  onClose,
  request,
  onEditQuote,
}: RequestDetailsModalProps) {
  if (!request) return null;

  const analysisData = request.analysis_data;
  const summary = analysisData?.summary;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Quote Request Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {request.request_number}
          </Typography>
          <Chip
            label={request.status}
            color={request.status === 'pending' ? 'warning' : 'success'}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Customer Information
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableBody>
            <TableRow>
              <TableCell width="30%"><strong>Name:</strong></TableCell>
              <TableCell>{request.customer_name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Email:</strong></TableCell>
              <TableCell>{request.customer_email}</TableCell>
            </TableRow>
            {request.customer_phone && (
              <TableRow>
                <TableCell><strong>Phone:</strong></TableCell>
                <TableCell>{request.customer_phone}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell><strong>Submitted:</strong></TableCell>
              <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Appliances List
        </Typography>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
          <Typography style={{ whiteSpace: 'pre-wrap' }}>{request.appliances}</Typography>
        </Box>

        {summary && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              AI Analysis Summary
            </Typography>
            <Table size="small" sx={{ mb: 3 }}>
              <TableBody>
                <TableRow>
                  <TableCell width="50%"><strong>Peak Load:</strong></TableCell>
                  <TableCell>{summary.peakLoadWatts || summary.totalPeakLoadWatts} W</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Daily Energy:</strong></TableCell>
                  <TableCell>{summary.dailyKWh || summary.totalDailyKWh} kWh</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Recommended Inverter:</strong></TableCell>
                  <TableCell>{summary.recommendedInverterKW} kW</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Recommended Battery:</strong></TableCell>
                  <TableCell>{summary.recommendedBatteryKWh} kWh</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Recommended Solar:</strong></TableCell>
                  <TableCell>{summary.recommendedSolarKW} kW</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            AI Quote Status:
          </Typography>
          {request.has_ai_quote ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon color="success" />
              <Typography color="success.main">Generated</Typography>
              <Chip label={request.ai_quote_id} size="small" variant="outlined" />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PendingIcon color="warning" />
              <Typography color="warning.main">Not Generated</Typography>
            </Box>
          )}
        </Box>

        {request.has_ai_quote && request.ai_quote_id && onEditQuote && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                onEditQuote(request.ai_quote_id!);
                onClose();
              }}
            >
              Edit AI-Generated Quote
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
