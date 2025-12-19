// src/components/VerificationBanner.tsx
"use client";

import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';

export default function VerificationBanner() {
  const { user } = useAuth();

  if (!user || user.is_verified) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-0.5" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Email Verification Required</span>
            <br />
            Please verify your email address to access all features. Check your inbox for a verification link or{' '}
            <Link 
              href={`/request-verification?email=${encodeURIComponent(user.email)}`}
              className="font-medium text-yellow-700 underline hover:text-yellow-600 transition-colors"
            >
              request a new one
            </Link>.
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Link
            href={`/request-verification?email=${encodeURIComponent(user.email)}`}
            className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            <FaEnvelope className="mr-1" />
            Resend
          </Link>
        </div>
      </div>
    </div>
  );
}
