// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import RootProviders from '@/components/RootProviders';
import Script from "next/script";

export const metadata: Metadata = {
  title: "Sunleaf Technologies Kenya | Solar Panels, Inverters & Lithium Batteries",
  description: "Leading solar energy solutions provider in Kenya. Shop premium solar panels, hybrid inverters, lithium batteries & solar outdoor lights. Free delivery in Nairobi. Expert installation available.",
  keywords: ["solar panels Kenya", "solar inverters", "lithium batteries", "solar energy", "renewable energy Kenya", "solar installation Nairobi", "hybrid inverters", "solar outdoor lights"],
  authors: [{ name: "Sunleaf Technologies" }],
  creator: "Sunleaf Technologies",
  publisher: "Sunleaf Technologies",
  metadataBase: new URL("https://sunleaftechnologies.co.ke"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://sunleaftechnologies.co.ke",
    siteName: "Sunleaf Technologies",
    title: "Sunleaf Technologies Kenya | Solar Panels, Inverters & Lithium Batteries",
    description: "Leading solar energy solutions provider in Kenya. Shop premium solar panels, hybrid inverters, lithium batteries & solar outdoor lights. Free delivery in Nairobi.",
    images: [
      {
        url: "/images/remove background.svg",
        width: 1200,
        height: 630,
        alt: "Sunleaf Technologies - Solar Energy Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunleaf Technologies Kenya | Solar Panels, Inverters & Lithium Batteries",
    description: "Leading solar energy solutions provider in Kenya. Shop premium solar panels, hybrid inverters, lithium batteries & solar outdoor lights.",
    images: ["/images/remove background.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "G-F3ZD9XTVHG",
  },
  manifest: "/manifest.json",
};

// ✅ Add this block — this ensures mobile/tablet responsiveness works properly
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#facc15",
};

export default function RootLayout({ children }: { children: ReactNode }) {
return (
 <html lang="en" suppressHydrationWarning>
  <head> 
        {/* Favicons - Multi-format for maximum compatibility */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/images/remove background.svg" />
        
        {/* Theme Color for Mobile Browsers */}
        <meta name="theme-color" content="#facc15" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Resource Hints for Performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Organization Schema */}
        <Script id="organization-schema" type="application/ld+json" strategy="beforeInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sunleaf Technologies",
              "url": "https://sunleaftechnologies.co.ke",
              "logo": "https://sunleaftechnologies.co.ke/images/remove background.svg",
              "description": "Leading solar energy solutions provider in Kenya",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KE",
                "addressLocality": "Nairobi",
                "addressRegion": "Nairobi County"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "areaServed": "KE"
              },
              "sameAs": []
            }
          `}
        </Script>
        
        {/* LocalBusiness Schema */}
        <Script id="local-business-schema" type="application/ld+json" strategy="beforeInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Sunleaf Technologies",
              "image": "https://sunleaftechnologies.co.ke/images/remove background.svg",
              "url": "https://sunleaftechnologies.co.ke",
              "telephone": "",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "",
                "addressLocality": "Nairobi",
                "addressRegion": "Nairobi County",
                "addressCountry": "KE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -1.286389,
                "longitude": 36.817223
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "17:00"
              }
            }
          `}
        </Script>
        
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
