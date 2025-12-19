import React, { useState } from 'react';
import styles from '@/styles/QuoteModal.module.css';
import axios from 'axios';

interface QuoteItem {
  description: string;
  quantity: string;
  price: string;
}

interface CreateQuoteModalProps {
  onClose: () => void;
  onQuoteCreated: () => void;
}

const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({ onClose, onQuoteCreated }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: '', price: '' }]);
  const [notes, setNotes] = useState('');
  const [tax, setTax] = useState('');
  const [discount, setDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: string
  ) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
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

    setSubmitting(true);
    try {
      // Prepare numeric values
      const normalizedItems = items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
      }));
      await axios.post('/api/createQuote.php', {
        customer_name: customerName,
        customer_email: customerEmail,
        items: normalizedItems,
        notes,
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
      });
      onQuoteCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create quote:', error);
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
          {items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <input
                type="text"
                placeholder="Item Description"
                value={item.description}
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
