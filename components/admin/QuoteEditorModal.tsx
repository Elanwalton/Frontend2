"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { apiGet, apiPost } from '@/utils/apiClient';

interface QuoteItem {
  product_id: number;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

interface QuoteEditorModalProps {
  open: boolean;
  onClose: () => void;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  onSave: () => void;
}

export default function QuoteEditorModal({
  open,
  onClose,
  quoteNumber,
  customerName: initialCustomerName,
  customerEmail: initialCustomerEmail,
  onSave,
}: QuoteEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomerName(initialCustomerName);
      setCustomerEmail(initialCustomerEmail);
      // Only load details if editing existing quote
      if (quoteNumber) {
        loadQuoteDetails();
      } else {
        // Reset items for new quote
        setItems([]);
        setLoading(false);
      }
      loadProducts();
    }
  }, [open, quoteNumber]);

  const loadQuoteDetails = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>(`/admin/getQuotationDetails?quote_number=${quoteNumber}`);
      if (res?.success && res?.data) {
        setItems(res.data.items || []);
        setCustomerName(res.data.customer_name || initialCustomerName);
        setCustomerEmail(res.data.customer_email || initialCustomerEmail);
      }
    } catch (error) {
      console.error('Failed to load quote details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setSearchLoading(true);
    try {
      const res = await apiGet<any>('/products');
      if (res?.success && res?.data) {
        setProducts(res.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price || 0),
          description: p.description,
        })));
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      product_id: 0,
      name: '',
      description: '',
      quantity: 1,
      price: 0,
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleProductSelect = (index: number, product: Product | null) => {
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
      };
      setItems(newItems);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = 0; // VAT is 0%
    return subtotal + vat;
  };

  const handleSave = async () => {
    if (!customerName || !customerEmail) {
      alert('Customer name and email are required');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      let res;
      
      // If no quote number, this is a new quote creation
      if (!quoteNumber) {
        res = await apiPost('/createQuote', {
          customer_name: customerName,
          customer_email: customerEmail,
          items: items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
          notes: ''
        });
      } else {
        // Update existing quote
        res = await apiPost('/admin/updateQuote', {
          quote_number: quoteNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          items: items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        });
      }

      if (res?.success) {
        onSave();
        onClose();
      } else {
        alert('Failed to save quote: ' + (res?.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to save quote:', error);
      alert('Failed to save quote: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Quote - {quoteNumber}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Quote Items</Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined" size="small">
                Add Item
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="35%">Product</TableCell>
                  <TableCell width="25%">Description</TableCell>
                  <TableCell width="10%" align="center">Qty</TableCell>
                  <TableCell width="15%" align="right">Price</TableCell>
                  <TableCell width="15%" align="right">Total</TableCell>
                  <TableCell width="5%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Autocomplete
                        options={products}
                        getOptionLabel={(option) => option.name}
                        loading={searchLoading}
                        value={products.find(p => p.id === item.product_id) || null}
                        onChange={(e, value) => handleProductSelect(index, value)}
                        renderInput={(params) => (
                          <TextField {...params} size="small" placeholder="Search products..." />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography>KES {(item.quantity * item.price).toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleRemoveItem(index)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ minWidth: 300 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="bold">KES {calculateSubtotal().toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>VAT (0%):</Typography>
                  <Typography>KES 0.00</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #ddd' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold">KES {calculateTotal().toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
