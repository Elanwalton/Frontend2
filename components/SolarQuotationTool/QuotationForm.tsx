'use client';

import { useState } from 'react';
import styles from './QuotationForm.module.css';
import type { QuoteRequestData } from './types';
import { getApiUrl } from '@/utils/apiUrl';

interface QuotationFormProps {
  onSubmitSuccess: (data: QuoteRequestData) => void;
}

export default function QuotationForm({ onSubmitSuccess }: QuotationFormProps) {
  const [appliances, setAppliances] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!appliances.trim()) {
      setError('Please enter your appliances');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please enter your name and email');
      return;
    }

    setLoading(true);

    try {
      const url = getApiUrl('/solar/submitQuoteRequest');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appliances,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      // Check if response is ok and has content
      if (!response.ok) {
        const text = await response.text();
        console.error('API Error Response:', text);
        throw new Error(`Server error: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response from server');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit request');
      }

      onSubmitSuccess(result.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2>Get Your Custom Solar System Quote</h2>
        <p>Tell us about your appliances and we&apos;ll recommend a complete solar system for your needs.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="appliances">List your appliances</label>
        <textarea
          id="appliances"
          value={appliances}
          onChange={(e) => setAppliances(e.target.value)}
          placeholder="e.g., 2 refrigerators, 3 TVs, laptop, 10 LED lights, washing machine, microwave..."
          rows={4}
          disabled={loading}
          className={styles.textarea}
        />
        <small className={styles.hint}>Type naturally - AI will analyze your power needs and recommend a complete solar kit including panels, inverter, battery, and accessories.</small>
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label htmlFor="customer-name">Your Name *</label>
          <input
            type="text"
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="John Doe"
            disabled={loading}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="customer-email">Your Email *</label>
          <input
            type="email"
            id="customer-email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={loading}
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="customer-phone">Phone Number (Optional)</label>
        <input
          type="tel"
          id="customer-phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="+254 712 345 678"
          disabled={loading}
          className={styles.input}
        />
      </div>

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className={styles.spinner} />
            Submitting Request...
          </>
        ) : (
          'Submit Quote Request'
        )}
      </button>

      <div className={styles.disclaimer}>
        <p><strong>📋 What happens next:</strong></p>
        <ul>
          <li>Our AI will analyze your power needs</li>
          <li>A preliminary quote will be generated</li>
          <li>Our team will review and refine the quote</li>
          <li>You&apos;ll receive the final quote via email within 24 hours</li>
        </ul>
      </div>
    </form>
  );
}
