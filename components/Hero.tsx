"use client";

import React, { useEffect, useState } from "react";
import { getApiUrl } from '../../utils/apiUrl';
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import styles from "@styles/HeroSection.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface HeroBanner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  position: 'main' | 'side';
  display_order: number;
  status: string;
}

export default function HeroSection() {
  const [mainBanners, setMainBanners] = useState<HeroBanner[]>([]);
  const [sideBanners, setSideBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fallbackMainBanners: HeroBanner[] = [
      {
        id: 1,
        title: "Power Your Future with Solar Energy",
        subtitle: "Premium solar panels and renewable energy solutions",
        image_url: "/images/HeroMantion.jpg",
        link_url: "/categories?category=solar%20panels",
        position: "main",
        display_order: 1,
        status: "active"
      }
    ];

    const fallbackSideBanners: HeroBanner[] = [
      {
        id: 2,
        title: "Battery Storage",
        subtitle: "Advanced lithium solutions",
        image_url: "/images/BYD-BATTERY-BOX.webp",
        link_url: "/categories?category=Batteries",
        position: "side",
        display_order: 1,
        status: "active"
      },
      {
        id: 3,
        title: "Solar Inverters",
        subtitle: "High-performance conversion",
        image_url: "/images/growatt-solar-inverters-1.jpg",
        link_url: "/categories?category=Inverters",
        position: "side",
        display_order: 2,
        status: "active"
      },
      {
        id: 4,
        title: "Water Pumps",
        subtitle: "Efficient solar pumping",
        image_url: "/images/solar-water-pumping-inverters-for-sale-in-nairobi-kenya.webp",
        link_url: "/categories",
        position: "side",
        display_order: 3,
        status: "active"
      },
      {
        id: 5,
        title: "Accessories",
        subtitle: "Complete solar kits",
        image_url: "/images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg",
        link_url: "/categories?category=Mounting%20Accesories",
        position: "side",
        display_order: 4,
        status: "active"
      }
    ];

    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/?api\/?$/i, '');

    async function load() {
      try {
        const res = await fetch(`${getApiUrl('/api/hero_banners')}?action=active`, { 
          cache: "no-store"
        });
        
        if (!res.ok) throw new Error(`Hero API failed: ${res.status}`);
        const data = await res.json();
        
        if (!cancelled && data.success && Array.isArray(data.data)) {
          const main = data.data.filter((b: HeroBanner) => b.position === 'main');
          const side = data.data.filter((b: HeroBanner) => b.position === 'side').slice(0, 4);
          
          setMainBanners(main.length > 0 ? main : fallbackMainBanners);
          setSideBanners(side.length > 0 ? side : fallbackSideBanners);
        } else {
          if (!cancelled) {
            setMainBanners(fallbackMainBanners);
            setSideBanners(fallbackSideBanners);
          }
        }
      } catch (e: any) {
        console.error('Error loading hero banners:', e);
        if (!cancelled) {
          setError(e?.message || "Failed to load banners");
          setMainBanners(fallbackMainBanners);
          setSideBanners(fallbackSideBanners);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);


  const categories = [
    { id: "solar-inverters", name: "Solar Inverters", href: "/categories?category=Inverters" },
    { id: "solar-panels", name: "Solar Panels", href: "/categories?category=Solar%20Panels" },
    { id: "water-heaters", name: "Solar Water Heaters", href: "/categories?category=Water%20Heaters" },
    { id: "batteries", name: "Batteries & ESS", href: "/categories?category=Batteries" },
    { id: "outdoor-lights", name: "Solar Outdoor Lights", href: "/categories?category=Solar%20Lights" },
    { id: "charge-controllers", name: "Charge Controllers", href: "/categories?category=Charge%20Controllers" },
    { id: "accessories", name: "Accessories", href: "/categories?category=Mounting%20Accesories" },
  ];


  return (
    <section className={styles.hero}>
      {/* Sidebar with categories */}
      <motion.aside 
        className={styles.heroSidebar}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.sidebarHeader}>
          <Sparkles size={20} className={styles.sidebarIcon} />
          <span>Categories</span>
        </div>
        <ul className={styles.menuList}>
          {categories.map((c, index) => (
            <motion.li 
              key={c.id} 
              className={styles.menuItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 8, backgroundColor: "rgba(247, 200, 67, 0.1)" }}
            >
              <Link href={c.href}>
                <ChevronRight size={16} className={styles.menuIcon} />
                {c.name}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.aside>

      {/* Main Banner Carousel */}
      <motion.div 
        className={styles.heroLeft}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {loading ? (
          <div className={styles.skeleton}></div>
        ) : mainBanners.length > 0 ? (
          <div className={styles.swiperWrapper}>
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop={mainBanners.length > 1}
              speed={800}
              className={styles.heroSwiper}
            >
              {mainBanners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  <Link href={banner.link_url || '#'} className={styles.heroLink}>
                    <div className={styles.imageWrapper}>
                      <img
                        src={banner.image_url || undefined}
                        alt={banner.title}
                        className={styles.heroImg}
                        onError={(e) => {
                          // Hide image on error
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className={styles.overlay}></div>
                      
                      {/* Trending Badge */}
                      <motion.div 
                        className={styles.trendingBadge}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <TrendingUp size={16} />
                        <span>Trending</span>
                      </motion.div>

                      {/* Banner Content */}
                      <motion.div 
                        className={styles.heroText}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <h2>{banner.title}</h2>
                        {banner.subtitle && <p className={styles.subtitle}>{banner.subtitle}</p>}
                        <motion.button 
                          className={styles.buyBtn}
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Shop Now
                          <ChevronRight size={20} className={styles.btnIcon} />
                        </motion.button>
                      </motion.div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className={styles.skeleton}></div>
        )}
        {error && (
          <div role="status" aria-live="polite" className={styles.errorMsg}>
            We're showing featured banners while content loads.
          </div>
        )}
      </motion.div>

      {/* Side Banners (4 smaller ones) */}
      <motion.div 
        className={styles.heroRight}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${styles.banner} ${styles.skeleton}`} />
            ))
          : sideBanners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link href={banner.link_url || '#'} className={styles.banner}>
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className={styles.heroImg}
                  />
                  <div className={styles.overlay}></div>
                  <motion.div 
                    className={styles.bannerText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <p>{banner.title}</p>
                    <ChevronRight size={18} className={styles.bannerArrow} />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
      </motion.div>
    </section>
  );
}
