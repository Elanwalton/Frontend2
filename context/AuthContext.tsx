// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getApiEndpoint } from '@/utils/apiClient';
import { useToast } from '@/components/ToastProvider';

interface User {
  id: number;
  email: string;
  first_name: string;
  second_name?: string;
  phone?: string;
  profile_picture?: string;
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

  // Attempt to refresh the access token using the refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(getApiEndpoint('/auth/refresh'), {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      if (data.success && data.user) {
        // Token refreshed successfully, update user state
        const userData = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name || '',
          second_name: data.user.second_name || '',
          phone: data.user.phone || '',
          profile_picture: data.user.profile_picture || '',
          role: data.user.role,
          is_verified: true
        };
        setUser(userData);
        setUserRole(userData.role);
        console.log('AuthContext: Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

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
          profile_picture: data.user.profile_picture || '',
          role: data.user.role,
          is_verified: true
        };
        setUser(userData);
        setUserRole(userData.role);
        console.log('AuthContext: User authenticated:', userData.email);
      } else {
        // Check if this is an expired token error - try to refresh
        const errorCode = data.code || data.error?.code;
        if (errorCode === 'ACCESS_EXPIRED' || data.message?.includes('expired')) {
          console.log('AuthContext: Access token expired, attempting refresh...');
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Successfully refreshed, we're done
            return;
          }
        }
        
        // Don't log error for expected "unauthenticated" states
        const suppressedMessages = ['Missing access token', 'Not authenticated'];
        if (!suppressedMessages.includes(data.message)) {
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

  const pathname = usePathname();

  // Check auth status on initial load for ALL routes
  useEffect(() => {
    const checkInitialAuth = async () => {
      // Always check auth to update UI state (navbar profile, etc.)
      await checkAuth();
    };

    checkInitialAuth();
  }, [pathname]);

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
    // 1. Clear local state IMMEDIATELY to update the UI
    const wasAuthenticated = !!user;
    setUser(null);
    setUserRole(null);
    setIsLoading(false);

    try {
      // 2. Trigger navigation right away
      router.replace('/login');

      // 3. Show success toast (before it unmounts)
      if (wasAuthenticated) {
        toast.success('Logged Out', 'You have been successfully logged out.');
      }

      // 4. Perform backend cleanup (don't STRICTLY wait for this before visual feedback)
      await fetch(getApiEndpoint('/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
      
      // Give a small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      console.error('Logout failed:', error);
      if (wasAuthenticated) {
        toast.error('Logout Error', 'There was an issue logging out, but you have been cleared locally.');
      }
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