"use client";
import type { ReactNode } from "react";
import { CategoryProvider } from '@/context/CategoryContext';
import Header from '@/components/NavBarReusable';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <CategoryProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1, paddingBottom: '80px' }}>
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <WhatsAppWidget />
      </div>
    </CategoryProvider>
  );
}
