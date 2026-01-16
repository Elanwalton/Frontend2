// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiEndpoint } from '@/utils/apiClient';
import { useToast } from '@/components/ToastProvider';

interface User {
  id: number;
  email: string;
  first_name: string;
  second_name?: string;
  phone?: string;
  gender?: string;
  role: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      const response = await fetch(getApiEndpoint('/check-auth'), {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('checkAuth: Response from /check-auth:', data);

      if ((data.authenticated === true || data.success === true) && data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name,
          second_name: data.user.second_name || '',
          phone: data.user.phone || '',
          gender: data.user.gender || '',
          role: data.user.role,
          is_verified: true
        };
        setUser(userData);
        setUserRole(userData.role);
        console.log('AuthContext: User authenticated:', userData.email);
      } else {
        // Don't log error for expected "Missing access token" - it's normal for unauthenticated state
        if (data.message !== 'Missing access token') {
          console.error('Session validation failed:', data.message || 'Unknown error');
        }
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On network errors, don't immediately log out - user might still be logged in
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - keep user logged in but mark as potentially offline
        return;
      }
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on initial load only for protected routes
  useEffect(() => {
    // Only check auth if we're on a protected route
    const isProtectedRoute = window.location.pathname.startsWith('/admin-dashboard') || 
                           window.location.pathname.startsWith('/account') ||
                           window.location.pathname.startsWith('/cart');
    
    if (isProtectedRoute) {
      checkAuth();
    } else {
      // For public routes, don't block with auth errors
      setIsLoading(false);
    }
  }, []);

  // Reset loading state when user state changes
  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(getApiEndpoint('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Login response is not valid JSON', e);
        throw new Error('Unexpected response from server');
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Login failed');
      }

      const userData = data.user as User;

      setUser(userData);
      setUserRole(userData.role);
      setIsLoading(false); // Set loading to false after successful login
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(getApiEndpoint('/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
      // Give a small delay to ensure cookies are cleared before redirecting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show success toast only if user is currently authenticated
      if (user) {
        toast.success('Logged Out', 'You have been successfully logged out.');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Show error toast only if user is currently authenticated
      if (user) {
        toast.error('Logout Error', 'There was an issue logging out, but you have been logged out for security.');
      }
    } finally {
      // Always clear state
      setUser(null);
      setUserRole(null);
      setIsLoading(false); // Reset loading state
      // Use replace instead of push to prevent back button issues
      await router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };