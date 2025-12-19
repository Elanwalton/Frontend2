"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from '@/context/AuthContext';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import ToastProvider from '@/components/ToastProvider';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Show WhatsApp widget only on client pages and home page
  // Hide on admin dashboard and login pages
  const showWhatsApp = pathname && !pathname.includes('/admin-dashboard') && !pathname.includes('/login');

  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        {showWhatsApp && <WhatsAppWidget />}
      </AuthProvider>
    </ToastProvider>
  );
}