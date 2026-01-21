"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEnvelope, FaKey, FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from '../../app/styles/Auth.module.css';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { buildMediaUrl } from '@/utils/media';
import LoadingSpinner from '@/components/LoadingSpinner';

function LoginContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, userRole, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get('registered');
  const registeredEmail = searchParams?.get('email');
  const returnUrl = searchParams?.get('returnUrl');

  // Show success message if redirected from registration
  useEffect(() => {
    if (registered === '1' && registeredEmail) {
      setSuccessMessage(`Registration successful! Please check your email at ${registeredEmail} to verify your account before logging in.`);
      // Pre-fill the email field
      setFormData(prev => ({ ...prev, email: registeredEmail }));
    }
  }, [registered, registeredEmail]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole) {
      const destination = userRole === "admin" ? "/admin-dashboard" : "/";
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, userRole, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage("");

    try {
      const user = await login(formData.email.trim(), formData.password);
      console.log('Login successful, user role:', user.role);
      toast.success("Success", "Login successful!");
      
      // Redirect after a brief delay to allow cookies to be set
      setTimeout(() => {
        const destination = user.role === "admin" ? "/admin-dashboard" : "/";
        router.replace(destination);
      }, 500);
      
    } catch (err: any) {
      const msg = err?.message || "Login failed";
      console.error('Login error:', msg);
      setErrorMessage(msg);
      toast.error("Error", msg);
      setFormData((prev) => ({ ...prev, password: "" }));
      setIsLoadingForm(false);
    }
  };

  // ✅ Show full-screen spinner when either initial auth is loading or the login form is submitting
  // BUT: IF authenticated is TRUE, we are redirecting, so show spinner too to prevent flash
  if (isLoading || isLoadingForm || (isAuthenticated && !isLoading)) {
    return <LoadingSpinner fullScreen message={isLoading ? "Checking session" : "Signing you in..."} />;
  }

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
          
          <h2 className={styles.title}>Power Your Future with Solar Energy</h2>
          <p className={styles.description}>
            Access your renewable energy dashboard and monitor your solar panels, 
            inverters, and energy storage systems in real-time.
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

        {/* Right Side - Login Form */}
        <div className={styles.authRight}>
          <h3 className={styles.heading}>Welcome Back</h3>
          <p className={styles.subtitle}>Login to your account</p>

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <FaCheck className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && errorMessage.includes('verify') && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-yellow-700">
                    {errorMessage}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Didn't receive the email?{' '}
                    <Link 
                      href={`/request-verification?email=${encodeURIComponent(formData.email)}`}
                      className="font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      Resend verification email
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
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
                autoComplete="username"
                required
              />
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
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
            </div>

            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={styles.authBtn}
              disabled={isLoadingForm}
            >
              Sign In
            </button>

            <div className={styles.authLink}>
              Don't have an account? <Link href={`/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}>Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <LoginContent />
    </Suspense>
  );
}
