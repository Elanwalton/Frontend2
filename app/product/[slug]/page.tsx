import { notFound, redirect } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import Header from '@/components/NavBarReusable';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { CategoryProvider } from '@/context/CategoryContext';
import { Metadata } from 'next';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  short_description?: string;
  highlights: string[];
  inStock: boolean;
  stockCount: number;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  specifications: { label: string; value: string }[];
  reviews?: {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
    pros?: string;
    cons?: string;
    would_recommend?: boolean;
    verified_purchase?: boolean;
    images?: string[];
  }[];
  badges?: string[];
  meta_title?: string;
  meta_description?: string;
  schema_markup?: any;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
  : 'http://localhost/frontend2-dev'; 

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const isNumeric = /^\d+$/.test(slug);
    const productUrl = `${BACKEND_URL}/api/getProductDetails.php?${isNumeric ? 'id' : 'slug'}=${slug}`;
    
    // Fetch Product Details with Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const productResponse = await fetch(productUrl, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 180 }, // Increased cache to 3 minutes for better performance
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!productResponse.ok) throw new Error('Failed to fetch product');
    const productData = await productResponse.json();
    
    if (!productData.success) {
      console.warn(`Product not found for slug: ${slug}`);
      return null;
    }

    const product = productData.data;
    
    const safeParseJSON = (value: any): any[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };

    return {
      id: product.id.toString(),
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
      discount: product.discount_percentage ? parseFloat(product.discount_percentage) : undefined,
      rating: parseFloat(product.rating) || 0,
      reviewCount: parseInt(product.review_count) || 0,
      images: safeParseJSON(product.images),
      description: product.description || '',
      short_description: product.short_description,
      highlights: safeParseJSON(product.features || product.highlights),
      inStock: product.stock_quantity > 0,
      stockCount: parseInt(product.stock_quantity) || 0,
      colors: safeParseJSON(product.colors),
      sizes: safeParseJSON(product.sizes),
      specifications: safeParseJSON(product.specifications),
      reviews: [], // Reviews will be loaded client-side for better performance
      badges: safeParseJSON(product.badges),
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      schema_markup: product.schema_markup
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; 
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Sunleaf Technologies',
    };
  }

  return {
    title: product.meta_title || `${product.name} | Sunleaf Technologies`,
    description: product.meta_description || product.short_description || `Buy ${product.name} at the best price in Kenya from Sunleaf Technologies.`,
    alternates: {
      canonical: `https://sunleaftechnologies.co.ke/product/${product.slug || product.id}`,
    },
    openGraph: {
      title: product.meta_title || product.name,
      description: product.meta_description || product.short_description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Canonical Redirect: If URL slug doesn't match product slug (e.g. legacy ID), redirect
  if (product.slug && slug !== product.slug) {
    redirect(`/product/${product.slug}`);
  }

  // Augment Schema with aggregate rating (reviews will be loaded client-side)
  const enhancedSchema = product.schema_markup ? {
    ...product.schema_markup,
    aggregateRating: product.reviewCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  } : null;

  return (
    <CategoryProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          {/* Inject Enhanced Schema.org JSON-LD */}
          {enhancedSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(enhancedSchema) }}
            />
          )}

          <ProductDetailClient 
            product={product} 
            breadcrumbItems={[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/categories' }, 
              { label: product.category, href: `/category/${product.slug || product.id}` }, 
              { label: product.name, href: `/product/${product.slug}` }
            ]}
          />
        </main>
        <Footer />
        <MobileBottomNav />
        <WhatsAppWidget />
      </div>
    </CategoryProvider>
  );
}
