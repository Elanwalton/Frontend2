// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import RootProviders from '@/components/RootProviders';
import Script from "next/script";

export const metadata: Metadata = {
  title: "Sunleaf-Technologies",
  description: "Shop solar panels, batteries, and renewable energy solutions at SunLeaf Tech",
};

// ✅ Add this block — this ensures mobile/tablet responsiveness works properly
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: ReactNode }) {
return (
 <html lang="en" suppressHydrationWarning>
  <head> 
        {/* Google Analytics 4 Tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-F3ZD9XTVHG`}
          strategy="afterInteractive"
        />
        
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F3ZD9XTVHG');
          `}
        </Script>
      </head>
    <body suppressHydrationWarning>
      <RootProviders>{children}</RootProviders>
    </body>
  </html>
);
}
