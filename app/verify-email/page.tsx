"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '../../app/styles/Auth.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle both /verify-email?token=... and /verify-email/?token=... formats
  const token = searchParams?.get('token') || 
                (typeof window !== 'undefined' && window.location.search.includes('token=') 
                  ? new URLSearchParams(window.location.search).get('token') 
                  : null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      console.log('Verifying token:', token);
      console.log('Token length:', token?.length);
      console.log('Token type:', typeof token);
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link - no token found.');
        return;
      }
      
      // Use Next.js API route
      const apiUrl = `${getApiEndpoint('/verify-email')}?token=${encodeURIComponent(token)}`;
      
      console.log('Calling API URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setStatus('error');
        setMessage('Invalid or expired verification link.');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      if (data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=1');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus('error');
      setMessage('An error occurred during verification: ' + errorMessage);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard} style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className={styles.authLeft}>
          {status === 'loading' && (
            <>
              <FaSpinner className="animate-spin" size={80} color="#10b981" style={{ marginBottom: '1.5rem' }} />
              <h2 className={styles.title}>Verifying Your Email...</h2>
              <p className={styles.description}>Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FaCheckCircle size={80} color="#10b981" style={{ marginBottom: '1.5rem' }} />
              <h2 className={styles.title}>Email Verified Successfully!</h2>
              <p className={styles.description}>{message}</p>
              <p className={styles.description}>You will be redirected to the login page shortly...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <FaExclamationTriangle size={80} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
              <h2 className={styles.title} style={{ color: '#ef4444' }}>Verification Failed</h2>
              <p className={styles.description}>{message}</p>
              <div style={{ marginTop: '2rem' }}>
                <Link href="/request-verification" className={styles.authBtn} style={{ display: 'inline-block', marginBottom: '1rem' }}>
                  Request New Verification Email
                </Link>
                <br />
                <Link href="/login" className={styles.authLink}>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
