// src/app/email-verified/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';
import styles from '../../app/styles/Auth.module.css';
import { Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get('email');

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard} style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className={styles.authLeft}>
          <div style={{ marginBottom: '2rem' }}>
            <FaCheckCircle 
              size={80} 
              color="#10b981" 
              style={{ marginBottom: '1.5rem' }} 
            />
            <h2 className={styles.title}>Email Verified Successfully!</h2>
          </div>
          
          <div className={styles.description}>
            <p>Thank you for verifying your email address <strong>{email}</strong>.</p>
            <p>Your account is now active and ready to use.</p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link href="/login" className={styles.authBtn} style={{ display: 'inline-block' }}>
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerified() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <EmailVerifiedContent />
    </Suspense>
  );
}