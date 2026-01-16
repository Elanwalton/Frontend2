"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CategoryProvider } from '@/context/CategoryContext';
import Header from '@/components/NavBarReusable';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(media.matches);
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
  }, []);

  const hideFooter = isMobile && pathname === '/';

  return (
    <CategoryProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1, paddingBottom: '80px' }}>
          {children}
        </main>
        {!hideFooter && <Footer />}
        <MobileBottomNav />
        <WhatsAppWidget />
      </div>
    </CategoryProvider>
  );
}
