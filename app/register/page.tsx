"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEnvelope, FaKey, FaUser, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { getApiEndpoint } from '@/utils/apiClient';
import { useToast } from '@/components/ToastProvider';
import { buildMediaUrl } from '@/utils/media';
import styles from '../../app/styles/Auth.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
}

const SignUpContent: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl');

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};:'",./<>?\\|`~]/.test(password)) score += 15;

    score = Math.min(score, 100);

    let level: 'weak' | 'fair' | 'good' | 'strong';
    let color: string;

    if (score < 40) {
      level = 'weak';
      color = '#ef4444';
    } else if (score < 60) {
      level = 'fair';
      color = '#f59e0b';
    } else if (score < 80) {
      level = 'good';
      color = '#3b82f6';
    } else {
      level = 'strong';
      color = '#10b981';
    }

    return { score, level, color };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName || !formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.secondName || !formData.secondName.trim()) newErrors.secondName = "Second name is required";
    if (!formData.email || !formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    else if (formData.email.includes('gmai.com')) newErrors.email = "Did you mean gmail.com?";
    else if (formData.email.includes('gmaill.com')) newErrors.email = "Did you mean gmail.com?";
    else if (formData.email.includes('yahooo.com')) newErrors.email = "Did you mean yahoo.com?";
    else if (formData.email.includes('outlok.com')) newErrors.email = "Did you mean outlook.com?";
    else if (formData.email.includes('hotmial.com')) newErrors.email = "Did you mean hotmail.com?";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain uppercase letter";
    else if (!/[a-z]/.test(formData.password)) newErrors.password = "Password must contain lowercase letter";
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain a number";
    else if (!/[!@#$%^&*()_+\-=\[\]{};:'",./<>?\\|`~]/.test(formData.password)) newErrors.password = "Password must contain special character";
    
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== handleSubmit called ===');
    console.log('Current formData:', formData);
    console.log('FormData values:', {
      firstName: formData.firstName,
      secondName: formData.secondName,
      email: formData.email,
      password: formData.password ? '***' : 'empty',
      confirmPassword: formData.confirmPassword ? '***' : 'empty'
    });
    
    if (!validate()) {
      console.log('Validation failed, returning');
      return;
    }

    try {
      const payload = JSON.stringify(formData);
      console.log('=== Register Page Debug ===');
      console.log('Form data state:', formData);
      console.log('Payload to send:', payload);
      console.log('Payload length:', payload.length);
      console.log('=== End Debug ===');
      
      // Call PHP backend directly using the same pattern as other components
      const response = await fetch(getApiEndpoint('/SignUp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        
        // Provide user-friendly error messages based on common issues
        if (formData.email.includes('gmai.com')) {
          setMessage('Please check your email address. Did you mean gmail.com?');
        } else if (formData.email && !formData.email.includes('.')) {
          setMessage('Please enter a complete email address (e.g., user@example.com)');
        } else if (formData.email && formData.email.split('@').length !== 2) {
          setMessage('Please enter a valid email address with one @ symbol');
        } else {
          setMessage('Unable to process your request. Please check your information and try again.');
        }
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Check if registration was successful
      if (data.success && data.requiresVerification) {
        // Redirect to login with success message and return URL
        const loginUrl = `/login?registered=1&email=${encodeURIComponent(formData.email)}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
        router.push(loginUrl);
        return;
      }
      
      // Display backend message or fallback success
      setMessage(data.message || "Signup successful!");
      
      // Clear form
      setFormData({
        firstName: "",
        secondName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      setErrors({});
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Signup failed, try again.";
      setMessage(errorMessage);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Left Side - Branding */}
        <div className={styles.authLeft}>
          <div className={styles.logo}>
            <Image 
              src={buildMediaUrl("remove-background.svg")} 
              alt="Sunleaf Tech Logo" 
              width={45} 
              height={45}
              className={styles.logoImage}
              priority
            />
            <span className={styles.logoText}>Sunleaf Tech</span>
          </div>
          
          <h2 className={styles.title}>Join Our Solar Revolution</h2>
          <p className={styles.description}>
            Create your account to access exclusive solar solutions, track your energy savings, 
            and manage your renewable energy systems all in one place.
          </p>
          
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheck size={14} />
              </div>
              Real-time energy monitoring
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheck size={14} />
              </div>
              Premium solar solutions
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheck size={14} />
              </div>
              24/7 customer support
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className={styles.authRight}>
          <h3 className={styles.heading}>Create an Account</h3>
          <p className={styles.subtitle}>Join Sunleaf Tech today</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={styles.formControl}
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className={styles.errorMessage}>{errors.firstName}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="secondName">Last Name</label>
                <input
                  type="text"
                  id="secondName"
                  name="secondName"
                  className={styles.formControl}
                  value={formData.secondName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
                {errors.secondName && <p className={styles.errorMessage}>{errors.secondName}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.formControl}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={styles.formControl}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {formData.password && passwordStrength && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: passwordStrength.color,
                      fontWeight: 'bold',
                      minWidth: '50px'
                    }}>
                      {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                    Must include: uppercase, lowercase, number, special character
                  </p>
                </div>
              )}

              {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={styles.formControl}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className={styles.errorMessage}>{errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit" 
              className={styles.authBtn}
            >
              Create Account
            </button>

            {message && (
              <p className={message.includes("success") ? styles.successMessage : styles.errorMessage}>
                {message}
              </p>
            )}

            <div className={styles.authLink}>
              Already have an account? <Link href="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SignUp: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <SignUpContent />
    </Suspense>
  );
};

export default SignUp;
