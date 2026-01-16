import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/QuoteModal.module.css';
import { getApiUrl } from '@/utils/apiUrl';

interface QuoteItem {
  product_id?: number;
  description: string;
  quantity: string;
  price: string;
}

interface ProductOption {
  id: number;
  name: string;
  price: number;
}

interface CreateQuoteModalProps {
  onClose: () => void;
  onQuoteCreated: () => void;
  onSuccessMessage?: (message: string) => void;
}

const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({ onClose, onQuoteCreated, onSuccessMessage }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: '', price: '' }]);
  const [notes, setNotes] = useState('');
  const [tax, setTax] = useState('');
  const [discount, setDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        let res = await fetch(getApiUrl('/api/getProducts'), {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        let json: any = null;
        try {
          json = await res.json();
        } catch {
          json = null;
        }

        if (!res.ok || !json?.success) {
          // Fallback: some environments use the admin endpoint
          res = await fetch(getApiUrl('/api/admin/getProducts'), {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          });
          json = await res.json();
          if (!res.ok || !json?.success) return;
        }
        const rows: ProductOption[] = (json.data || []).map((p: any) => ({
          id: Number(p.id),
          name: String(p.name || ''),
          price: Number(p.price || 0),
        }));
        if (!cancelled) setProducts(rows);
      } catch {
        // ignore
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const productByName = useMemo(() => {
    const map = new Map<string, ProductOption>();
    for (const p of products) {
      map.set(p.name.toLowerCase(), p);
    }
    return map;
  }, [products]);

  const handleItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: string
  ) => {
    const updatedItems = [...items];

    if (field === 'description') {
      updatedItems[index].description = value;
      // If the typed text matches a product, bind product_id + auto-fill price
      const match = productByName.get(value.trim().toLowerCase());
      if (match) {
        updatedItems[index].product_id = match.id;
        if (!(Number(updatedItems[index].price) > 0)) {
          updatedItems[index].price = String(match.price ?? 0);
        }
      } else {
        updatedItems[index].product_id = undefined;
      }
    } else if (field === 'quantity') {
      updatedItems[index].quantity = value;
    } else if (field === 'price') {
      updatedItems[index].price = value;
    }
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: '', price: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const qty = Number(item.quantity) || 0;
      const pr = Number(item.price) || 0;
      return total + qty * pr;
    }, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const disc = Number(discount) || 0;
    const tx = Number(tax) || 0;
    const discountAmount = (disc / 100) * subtotal;
    const taxed = ((subtotal - discountAmount) * tx) / 100;
    return subtotal - discountAmount + taxed;
  };

  const handleSubmit = async () => {
    // Validate quantities and prices
    const invalidItem = items.find(
      item => (Number(item.quantity) || 0) < 1 || (Number(item.price) || 0) < 0
    );
    if (invalidItem) {
      alert('Please ensure quantities ≥ 1 and prices ≥ 0');
      return;
    }

    // Allow both DB products and custom items. For custom items we rely on the backend to create
    // a placeholder product row and continue with quote creation.

    setSubmitting(true);
    try {
      // Prepare numeric values
      const normalizedItems = items.map(item => ({
        product_id: item.product_id || productByName.get(item.description.trim().toLowerCase())?.id,
        description: item.description,
        name: item.description,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
      }));
      
      const response = await fetch(getApiUrl('/api/createQuote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          items: normalizedItems,
          notes,
          tax: Number(tax) || 0,
          discount: Number(discount) || 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create quote: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create quote');
      }
      
      onSuccessMessage?.('Quote created successfully');
      onQuoteCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create quote:', error);
      alert('Failed to create quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Create Quotation</h2>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Customer Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>

        <div className={styles.itemsSection}>
          <h3>Quote Items</h3>
          {products.length === 0 && (
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
              Start typing in Item Description to see product suggestions. (Products are still loading.)
            </div>
          )}
          {items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <input
                type="text"
                placeholder="Item Description"
                value={item.description}
                list="quote-products"
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                onBlur={() => {
                  if ((Number(item.quantity) || 0) < 1) {
                    handleItemChange(index, 'quantity', '1');
                  }
                }}
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Unit Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                onBlur={() => {
                  if ((Number(item.price) || 0) < 0) {
                    handleItemChange(index, 'price', '0');
                  }
                }}
              />
              <button onClick={() => removeItem(index)} className={styles.removeBtn}>×</button>
            </div>
          ))}
          <datalist id="quote-products">
            {products.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
          <button className={styles.addItemBtn} onClick={addItem}>+ Add Item</button>
        </div>

        <div className={styles.summarySection}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Tax % (e.g., 16)"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Discount % (e.g., 10)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <textarea
            placeholder="Additional Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={styles.totalDisplay}>
          <p><strong>Subtotal:</strong> KES {getSubtotal().toFixed(2)}</p>
          <p><strong>Total:</strong> KES {getTotal().toFixed(2)}</p>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className={styles.submitBtn}>
            {submitting ? 'Creating...' : 'Create Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuoteModal;
