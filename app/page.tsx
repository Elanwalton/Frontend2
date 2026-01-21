"use client";
import React, { useEffect, useState } from "react";
import { Zap, TrendingUp, Star, Sparkles } from "lucide-react";
import { getApiUrl } from '@/utils/apiUrl';
import HeroSection from '@/components/Hero';
import ProductCategory from '@/components/ProductCategory';
import ProductCard from '@/components/ProductCard';
import HomePag from '@/components/TEST';
import FetchedCategorySection from '@/components/FetchedCategorySection';
import Header from '@/components/NavBarReusable';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { CategoryProvider } from '@/context/CategoryContext';
import sectionStyles from '@/styles/HomeSections.module.css';
import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import { buildMediaUrl } from '@/utils/media';

type Product = {
  id: number;
  image: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  stock?: number;
  description?: string;
};

export default function HomePage() {
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // API configuration handled by getApiUrl

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Get recently viewed products from localStorage
        let viewedIds: number[] = [];
        if (typeof window !== 'undefined') {
          try {
            const viewedStr = localStorage.getItem('recentlyViewed');
            viewedIds = viewedStr ? JSON.parse(viewedStr) : [];
          } catch (e) {
            console.error('Error reading localStorage:', e);
          }
        }

        const [res1, res2] = await Promise.all([
          fetch(`${getApiUrl('/api/getTopDeals')}?limit=8&type=auto`, { credentials: "include" }),
          fetch(`${getApiUrl('/api/getRecommendedProducts')}?limit=8`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify({ viewedIds })
          }),
        ]);
        const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

        console.log('Top Deals API Response:', data1);
        console.log('Recommended API Response:', data2);

        const mapItems = (data: any): Product[] =>
          (data?.data || []).map((item: any) => ({
            id: Number(item.id),
            image: buildMediaUrl(item.main_image_full_url || item.main_image_url),
            title: item.name,
            price: Number(item.price),
            category: item.category || "Uncategorized",
            rating: item.rating ? parseFloat(item.rating) : 0,
            reviews: item.review_count ? parseInt(item.review_count) : 0,
            stock: item.stock_quantity !== undefined ? parseInt(item.stock_quantity) : (item.quantity !== undefined ? parseInt(item.quantity) : undefined),
            description: item.description || item.short_description || undefined,
          }));

        if (!cancelled) {
          const topDealsData = mapItems(data1);
          const recommendedData = mapItems(data2);
          console.log('Mapped Top Deals:', topDealsData);
          console.log('Mapped Recommended:', recommendedData);
          setTopDeals(topDealsData);
          setRecommended(recommendedData);
        }
      } catch (e: any) {
        console.error('Load error:', e);
        if (!cancelled) setError(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) {
          setLoading(false);
          // Delay hiding initial loader for smooth transition
          setTimeout(() => setInitialLoad(false), 500);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(media.matches);
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
  }, []);

  if (initialLoad) {
    return <PageLoadingSpinner isLoading={initialLoad} />;
  }

  return (
    <>
      <CategoryProvider>
        <Header />
        <HeroSection/>
        <ProductCategory/>

        {/* Top Deals of the Month */}
        <section className={sectionStyles.section}>
          <div className={sectionStyles.header}>
            <div className={sectionStyles.titleWrapper}>
              <Zap className={sectionStyles.titleIcon} size={32} />
              <h2 className={sectionStyles.title}>Top Deals of the Month</h2>
              <div className={sectionStyles.titleBadge}>
                <TrendingUp size={16} />
                <span>Hot</span>
              </div>
            </div>
            <p className={sectionStyles.subtitle}>Limited time offers on premium products</p>
          </div>
          <div className={sectionStyles.grid}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={sectionStyles.skeleton} />
                ))
              : topDeals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {error && <p className={sectionStyles.error}>We're showing limited items while products load.</p>}
        </section>

        {/* Recommended for you */}
        <section className={`${sectionStyles.section} ${sectionStyles.sectionTightTop}`}>
          <div className={sectionStyles.header}>
            <div className={sectionStyles.titleWrapper}>
              <Sparkles className={sectionStyles.titleIcon} size={32} />
              <h2 className={sectionStyles.title}>Recommended for you</h2>
              <div className={sectionStyles.titleBadge}>
                <Star size={16} />
                <span>Curated</span>
              </div>
            </div>
            <p className={sectionStyles.subtitle}>Handpicked products based on your interests</p>
          </div>
          <div className={sectionStyles.grid}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={sectionStyles.skeleton} />
                ))
              : recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

     

        {/* Best Deals on Solar Outdoor - Dynamic banners from admin */}
        <FetchedCategorySection
          title="Solar Outdoor Lights"
          viewAllLink="/categories?category=Solar%20Outdoor%20Lights"
          fetchUrl={`${getApiUrl('/api/getProductsClients')}?page=1&limit=8&category=Solar%20Outdoor%20Lights`}
        />

        {/* Lithium Batteries - Dynamic banners from admin */}
        <FetchedCategorySection
          title="Lithium Batteries"
          viewAllLink="/categories?category=Batteries"
          fetchUrl={`${getApiUrl('/api/getProductsClients')}?page=1&limit=8&q=lithium%20battery`}
        />

        {/* Inverters - Dynamic banners from admin */}
        <FetchedCategorySection
          title="Inverters"
          viewAllLink="/categories?category=Inverters"
          fetchUrl={`${getApiUrl('/api/getProductsClients')}?page=1&limit=8&q=inverter`}
        />

        <div style={{ display: isMobile ? 'none' : 'block' }}>
          <Footer />
        </div>
      </CategoryProvider>

      <div className="md:hidden">
        <div style={{ height: '80px' }} /> {/* Spacer for MobileBottomNav */}
        <MobileBottomNav />
      </div>
    </>
  );
}
