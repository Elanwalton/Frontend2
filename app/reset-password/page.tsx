"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getApiEndpoint } from '../../utils/apiClient';
import styles from '../../app/styles/Auth.module.css';
import { useToast } from '../../components/ToastProvider';
import LoadingSpinner from '../../components/LoadingSpinner';

interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
}

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setErrors({ token: "Invalid reset link. Please request a new one." });
    }
  }, [token]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;

    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
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

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain a number";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};:'",./<>?\\|`~]/.test(formData.password)) {
      newErrors.password = "Password must contain a special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;

    setIsLoading(true);

    try {
      const response = await fetch(getApiEndpoint('/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        toast.success("Success", "Password reset successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErrors({ form: data.message || "Failed to reset password" });
        toast.error("Error", data.message || "Failed to reset password");
      }
    } catch (error: any) {
      const msg = error.message || "An error occurred";
      setErrors({ form: msg });
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
          
          <h2 className={styles.title}>Create New Password</h2>
          <p className={styles.description}>
            Create a strong password to secure your account. 
            Make sure it includes uppercase, lowercase, numbers, and special characters.
          </p>
          
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheckCircle size={14} />
              </div>
              At least 8 characters
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheckCircle size={14} />
              </div>
              Mix of uppercase & lowercase
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCheckCircle size={14} />
              </div>
              Numbers and special characters
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.authRight}>
          <h3 className={styles.heading}>Reset Password</h3>
          <p className={styles.subtitle}>Enter your new password</p>

          {successMessage ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <FaCheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Password reset successful!</p>
                  <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                  <p className="text-sm text-green-600 mt-2">Redirecting to login...</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={styles.formControl}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    disabled={isLoading}
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
                    disabled={isLoading}
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

              {errors.form && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <p className="text-sm text-red-700">{errors.form}</p>
                  </div>
                </div>
              )}

              {errors.token && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-red-700">{errors.token}</p>
                      <Link href="/forgot-password" className="text-sm text-red-600 underline hover:text-red-700 mt-1 inline-block">
                        Request a new reset link
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.authBtn}
                disabled={isLoading || !token || !formData.password || !formData.confirmPassword}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
