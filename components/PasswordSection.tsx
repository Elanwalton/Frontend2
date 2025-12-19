import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '@/styles/PasswordSection.module.css';

const PasswordSection = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');

    // Validation
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setStatus('error');
      setMessage('All fields are required');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setStatus('error');
      setMessage('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(getApiEndpoint('/change-password'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Password changed successfully!');
        setFormData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while changing password');
    } finally {
      if (status === 'loading') {
        setStatus('idle');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2>Change Password</h2>
        <p>Update your account password for better security</p>
      </div>

      {status !== 'idle' && (
        <motion.div 
          className={`${styles.statusMessage} ${status === 'success' ? styles.success : styles.error}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message}</span>
        </motion.div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>
            <Lock size={16} />
            Current Password
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPasswords.current ? "text" : "password"}
              name="current_password"
              value={formData.current_password}
              onChange={handleInputChange}
              placeholder="Enter current password"
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className={styles.toggleBtn}
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>
            <Lock size={16} />
            New Password
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPasswords.new ? "text" : "password"}
              name="new_password"
              value={formData.new_password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className={styles.toggleBtn}
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>
            <Lock size={16} />
            Confirm New Password
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className={styles.toggleBtn}
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.btn} disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Updating Password...
            </>
          ) : (
            <>
              <Lock size={20} />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PasswordSection;
