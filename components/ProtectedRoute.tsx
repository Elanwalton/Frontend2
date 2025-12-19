'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'client' | 'admin';
}

/**
 * ProtectedRoute Component
 * 
 * Wraps pages that require authentication.
 * Redirects unauthenticated users to login page.
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole = 'client' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/checkout';
      router.replace(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If role is specified and doesn't match, redirect to home
    if (requiredRole && userRole !== requiredRole) {
      router.replace('/');
      return;
    }
  }, [isLoading, isAuthenticated, userRole, requiredRole, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying access..." />;
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role doesn't match, don't render anything (will redirect)
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}
