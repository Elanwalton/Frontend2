"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, AlertCircle, X } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '@/styles/LogoutSection.module.css';

const LogoutSection = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoutClick = () => {
    // Show browser confirmation dialog
    const confirmed = window.confirm('Are you sure you want to sign out of your account? You will need to log in again to access your account.');
    if (confirmed) {
      setShowConfirm(true);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      // Notify backend (cookie-based stateless logout)
      await fetch(getApiEndpoint('/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Call logout function from auth context in background (don't wait for it)
      if (logout) {
        logout().catch(err => console.error('Auth context logout failed:', err));
      }
      // Redirect immediately without waiting for API or context
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API fails
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2>Account Security</h2>
        <p>Manage your account session and security settings</p>
      </div>

      <div className={styles.logoutCard}>
        <div className={styles.cardContent}>
          <div className={styles.cardIcon}>
            <LogOut size={32} />
          </div>
          <div className={styles.cardText}>
            <h3>Sign Out of Your Account</h3>
            <p>You will be logged out from all devices. You can log back in anytime with your credentials.</p>
          </div>
        </div>
        <button 
          className={styles.logoutBtn} 
          onClick={handleLogoutClick}
          disabled={isLoading}
        >
          {isLoading ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            >
              <motion.div 
                className={styles.modal}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div className={styles.warningIcon}>
                    <AlertCircle size={28} />
                  </div>
                  <button 
                    className={styles.closeBtn}
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className={styles.modalContent}>
                  <h3>Confirm Sign Out</h3>
                  <p>Are you sure you want to sign out of your account? You will need to log in again to access your account.</p>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.confirmBtn}
                    onClick={handleConfirmLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing Out...' : 'Yes, Sign Out'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default LogoutSection;
