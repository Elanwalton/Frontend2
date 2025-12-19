// src/app/verification-error/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from '../../app/styles/Auth.module.css';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

function VerificationErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = () => {
    if (error?.includes('expired')) {
      return {
        title: 'Link Expired',
        message: 'The verification link has expired. Please request a new one.'
      };
    } else if (error?.includes('already been used') || error?.includes('already been verified')) {
      return {
        title: 'Link Already Used',
        message: 'This verification link has already been used. Please try logging in.'
      };
    }
    return {
      title: 'Verification Failed',
      message: error || 'An error occurred during email verification. Please try again.'
    };
  };

  const { title, message } = getErrorMessage();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard} style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className={styles.authLeft}>
          <div style={{ marginBottom: '2rem' }}>
            <FaExclamationTriangle 
              size={80} 
              color="#ef4444" 
              style={{ marginBottom: '1.5rem' }} 
            />
            <h2 className={styles.title} style={{ color: '#ef4444' }}>{title}</h2>
          </div>
          
          <div className={styles.description}>
            <p>{message}</p>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link 
              href="/login" 
              className={styles.authBtn} 
              style={{ 
                display: 'inline-block',
                background: '#10b981'
              }}
            >
              Go to Login
            </Link>
            
            <Link 
              href="/register" 
              className={styles.authLink}
              style={{ 
                display: 'inline-block',
                marginTop: '1rem'
              }}
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationError() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <VerificationErrorContent />
    </Suspense>
  );
}