"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '../../app/styles/Auth.module.css';
import { useToast } from '@/components/ToastProvider';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(getApiEndpoint('/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success("Success", "Check your email for reset instructions");
      } else {
        setErrorMessage(data.message || "Failed to send reset email");
        toast.error("Error", data.message || "Failed to send reset email");
      }
    } catch (error: any) {
      const msg = error.message || "An error occurred";
      setErrorMessage(msg);
      toast.error("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Left Side - Branding */}
        <div className={styles.authLeft}>
          <div className={styles.logo}>
            <Image 
              src="/remove background (1).svg" 
              alt="Sunleaf Tech Logo" 
              width={45} 
              height={45}
              className={styles.logoImage}
              priority
            />
            <span className={styles.logoText}>Sunleaf Tech</span>
          </div>
          
          <h2 className={styles.title}>Reset Your Password</h2>
          <p className={styles.description}>
            Don't worry! We'll help you regain access to your account. 
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheck size={14} />
              </div>
              Secure password reset
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheck size={14} />
              </div>
              Quick and easy process
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheck size={14} />
              </div>
              24/7 support available
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.authRight}>
          <h3 className={styles.heading}>Forgot Password?</h3>
          <p className={styles.subtitle}>Enter your email to reset</p>

          {submitted ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <FaCheck className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Check your email</p>
                  <p className="text-sm text-green-600 mt-1">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    The link will expire in 1 hour.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Didn't receive it? Check your spam folder or{' '}
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="font-medium text-green-700 underline hover:text-green-600"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.formControl}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.authBtn}
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className={styles.authLink}>
                Remember your password? <Link href="/login">Sign in</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
