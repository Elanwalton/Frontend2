"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { getApiEndpoint } from '../../utils/apiClient';
import styles from '../../app/styles/Auth.module.css';

export default function RequestVerification() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    // Enhanced email validation with common typo detection
    if (!email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address with @ symbol');
      return;
    }

    if (email.includes('gmai.com')) {
      setStatus('error');
      setMessage('Please check your email address. Did you mean gmail.com?');
      return;
    }

    if (email.includes('gmaill.com')) {
      setStatus('error');
      setMessage('Please check your email address. Did you mean gmail.com?');
      return;
    }

    if (email.includes('yahooo.com')) {
      setStatus('error');
      setMessage('Please check your email address. Did you mean yahoo.com?');
      return;
    }

    if (email.includes('outlok.com')) {
      setStatus('error');
      setMessage('Please check your email address. Did you mean outlook.com?');
      return;
    }

    if (email.includes('hotmial.com')) {
      setStatus('error');
      setMessage('Please check your email address. Did you mean hotmail.com?');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setMessage('Please enter a complete email address (e.g., user@example.com)');
      return;
    }

    setStatus('loading');
    
    try {
      const response = await fetch(getApiEndpoint('/request-verification'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Verification email sent! Please check your inbox.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard} style={{ maxWidth: '600px' }}>
        <div className={styles.authLeft}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <FaEnvelope size={60} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h2 className={styles.title}>Request Verification Email</h2>
            <p className={styles.description}>
              Enter your email address and we'll send you a new verification link.
            </p>
          </div>

          {status === 'success' && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#d1fae5', 
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <FaCheckCircle size={40} color="#10b981" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: '#065f46', fontWeight: 'bold' }}>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fee2e2', 
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <FaExclamationTriangle size={40} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: '#7f1d1d', fontWeight: 'bold' }}>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                className={styles.formControl}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>

            <button 
              type="submit" 
              className={styles.authBtn}
              disabled={status === 'loading'}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {status === 'loading' && <FaSpinner className="animate-spin" />}
              {status === 'loading' ? 'Sending...' : 'Send Verification Email'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className={styles.description}>
              Already have a verification link?{' '}
              <Link href="/verify-email" className={styles.authLink}>
                Verify here
              </Link>
            </p>
            <p className={styles.description}>
              <Link href="/login" className={styles.authLink}>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
