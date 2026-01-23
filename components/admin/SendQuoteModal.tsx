"use client";

import React, { useState } from 'react';
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon, Email as EmailIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { apiPost } from '@/utils/apiClient';

interface SendQuoteModalProps {
  open: boolean;
  onClose: () => void;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onSuccess: () => void;
}

export default function SendQuoteModal({
  open,
  onClose,
  quoteNumber,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
}: SendQuoteModalProps) {
  const [sending, setSending] = useState(false);
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await apiPost('/admin/sendQuote', {
        quote_number: quoteNumber,
        method: method,
      });

      if (res?.success) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to send quote: ' + (res?.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to send quote:', error);
      alert('Failed to send quote: ' + (error?.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Quote to Customer</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Quote Number
          </Typography>
          <Typography variant="h6" gutterBottom>
            {quoteNumber}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Customer Details
          </Typography>
          <Typography><strong>Name:</strong> {customerName}</Typography>
          <Typography><strong>Email:</strong> {customerEmail}</Typography>
          {customerPhone && <Typography><strong>Phone:</strong> {customerPhone}</Typography>}
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Send Method</FormLabel>
          <RadioGroup value={method} onChange={(e) => setMethod(e.target.value as 'email' | 'whatsapp')}>
            <FormControlLabel
              value="email"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  <span>Email</span>
                  {!customerEmail && <Chip label="No email" size="small" color="error" />}
                </Box>
              }
              disabled={!customerEmail}
            />
            <FormControlLabel
              value="whatsapp"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WhatsAppIcon fontSize="small" />
                  <span>WhatsApp</span>
                  {!customerPhone && <Chip label="No phone" size="small" color="error" />}
                </Box>
              }
              disabled={!customerPhone}
            />
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> This will mark the quote as reviewed and send it to the customer via {method}.
            The quote status will be updated to "sent".
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>Cancel</Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          disabled={sending || (!customerEmail && method === 'email') || (!customerPhone && method === 'whatsapp')}
        >
          {sending ? 'Sending...' : 'Send Quote'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
