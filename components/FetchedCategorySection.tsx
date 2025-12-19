"use client";
import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../utils/apiUrl';
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Star } from "lucide-react";
import SimplifiedProductCard from '../../components/SimplifiedProductCard';
import styles from '../../styles/FetchedCategorySection.module.css';
import { buildMediaUrl } from '../../utils/media';

interface Banner {
  image: string;
  link: string;
}

interface CategoryBanner {
  id: number;
  category_name: string;
  image_url: string;
  link_url: string;
  display_order: number;
  status: string;
}

interface FetchedCategorySectionProps {
  title: string;
  fetchUrl: string;
  viewAllLink: string;
  banners?: Banner[]; // Make optional for backward compatibility
}

interface ApiProduct {
  id: number | string;
  main_image_url: string;
  main_image_full_url?: string;
  name: string;
  price: number | string;
  category?: string;
  description?: string;
  short_description?: string;
}

interface SectionProduct {
  id: number;
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  tag?: string;
  discount?: string;
  soldInfo?: string;
}

// Fallback banners for different categories
const getFallbackBanners = (categoryTitle: string): Banner[] => {
  switch (categoryTitle) {
    case 'Solar Outdoor Lights':
      return [
        {
          image: '/images/Outdoorlights.jpg',
          link: '/categories?category=Solar%20Outdoor%20Lights'
        },
        {
          image: '/images/FloodLight.jpg',
          link: '/categories?category=Solar%20Outdoor%20Lights'
        },
        {
          image: '/images/Outdoorlights.jpg',
          link: '/categories?category=Solar%20Outdoor%20Lights'
        }
      ];
      
    // case 'Lithium Batteries':
    //   return [
    //     {
    //       image: '/images/BYD-BATTERY-BOX.webp',
    //       link: '/categories?category=Batteries'
    //     },
    //     {
    //       image: '/images/5kwh-battery-battery-manufacturer.webp',
    //       link: '/categories?category=Batteries'
    //     },
    //     {
    //       image: '/images/stacked-lithium-batterya12585ed-07d0-4428-87f9-2f6156dd927d.jpg',
    //       link: '/categories?category=Batteries'
    //     }
    //   ];
      
    case 'Inverters':
      return [
        {
          image: '/images/growatt-solar-inverters-1.jpg',
          link: '/categories?category=Inverters'
        },
        {
          image: '/images/Growatt-Solar-Inverter-off-Grid-MPPT-Controller-Converter-2kVA-3kVA-5kVA.jpg',
          link: '/categories?category=Inverters'
        },
        {
          image: '/images/must-solar-inverters-at-the-best-prices-in-nairobi-kenya.webp',
          link: '/categories?category=Inverters'
        }
      ];
      
    default:
      // Generic fallback for any other category
      return [
        {
          image: '/images/Outdoorlights.jpg',
          link: '/categories'
        },
        {
          image: '/images/HeroMantion.jpg',
          link: '/categories'
        },
        {
          image: '/images/Outdoorlights.jpg',
          link: '/categories'
        }
      ];
  }
};

const FetchedCategorySection: React.FC<FetchedCategorySectionProps> = ({
  title,
  fetchUrl,
  viewAllLink,
  banners: propBanners,
}) => {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [banners, setBanners] = useState<Banner[]>(propBanners || getFallbackBanners(title));
  const [loading, setLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);

  const API_BASE_RAW = process.env.NEXT_PUBLIC_API_URL || '';
  const API_BASE = API_BASE_RAW.replace(/\/+$/,'');

  // Initialize with fallback banners if no props provided
  useEffect(() => {
    if (!propBanners || propBanners.length === 0) {
      console.log(`[${title}] No prop banners, setting fallback banners`);
      const fallbacks = getFallbackBanners(title);
      console.log(`[${title}] Fallback banners:`, fallbacks);
      setBanners(fallbacks);
      setBannersLoading(false);
    } else {
      console.log(`[${title}] Using prop banners:`, propBanners);
      setBannersLoading(false);
    }
  }, [title, propBanners]);


  const safeParseJson = (raw: string): any => {
    try {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        const slice = raw.slice(start, end + 1);
        return JSON.parse(slice);
      }
      const aStart = raw.indexOf("[");
      const aEnd = raw.lastIndexOf("]");
      if (aStart !== -1 && aEnd !== -1 && aEnd > aStart) {
        const slice = raw.slice(aStart, aEnd + 1);
        return { data: JSON.parse(slice) };
      }
      return { data: [] };
    } catch {
      return { data: [] };
    }
  };

  // Fetch dynamic banners from API
  useEffect(() => {
    let cancelled = false;
    
    async function loadBanners() {
      // If banners are provided as props, use them and skip API call
      if (propBanners && propBanners.length > 0) {
        setBannersLoading(false);
        return;
      }

      try {
        const res = await fetch(`${getApiUrl('/api/category_banners')}?action=active&category=${encodeURIComponent(title)}`, {
          cache: 'no-store'
        });
        const data = await res.json();

        if (!cancelled && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const dynamicBanners: Banner[] = data.data.map((c: CategoryBanner) => ({
            image: buildMediaUrl(c.image_url),
            link: c.link_url || '#'
          }));
          setBanners(dynamicBanners);
        } else {
          // Use fallback banners if API fails or returns no data
          const fallbackBanners = getFallbackBanners(title);
          if (!cancelled) setBanners(fallbackBanners);
        }
      } catch (error) {
        console.error(`[${title}] Error loading banners:`, error);
        // Use fallback banners on error
        const fallbackBanners = getFallbackBanners(title);
        if (!cancelled) setBanners(fallbackBanners);
      } finally {
        if (!cancelled) setBannersLoading(false);
      }
    }

    loadBanners();
    return () => { cancelled = true; };
  }, [title, propBanners, API_BASE]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        console.log(`[${title}] Fetching from:`, fetchUrl);
        const res = await fetch(fetchUrl, { credentials: "include" });
        const raw = await res.text();
        console.log(`[${title}] Response status:`, res.status);
        const parsed = safeParseJson(raw);
        const apiItems: ApiProduct[] = (parsed?.data || []) as ApiProduct[];
        console.log(`[${title}] Fetched ${apiItems.length} products`);
        const mapped: SectionProduct[] = apiItems.slice(0, 8).map((p) => ({
          id: Number(p.id),
          image: buildMediaUrl(p.main_image_full_url || p.main_image_url),
          title: p.name,
          price: `Ksh ${Number(p.price).toLocaleString()}`,
        }));
        console.log(`[${title}] Mapped ${mapped.length} products`);
        if (!cancelled) {
          setProducts(mapped);
          setLoading(false);
        }
      } catch (error) {
        console.error(`[${title}] Error loading products:`, error);
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchUrl, title]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className={styles.categorySection}>
      {/* Section Title with Icon */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.titleWrapper}>
          <Zap className={styles.titleIcon} size={32} />
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.titleBadge}>
            <TrendingUp size={16} />
            <span>Trending</span>
          </div>
        </div>
        <p className={styles.subtitle}>Discover our curated collection of premium products</p>
      </motion.div>

      {/* Banner Row - Clickable promotional banners */}
      <motion.div 
        className={styles.bannerRow}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {banners.slice(0, 3).map((banner, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link 
              href={banner.link}
              className={`${styles.bannerCard} ${index === 2 ? styles.hideMobile : ''}`}
            >
              <div className={styles.bannerGlow} />
              <div className={styles.bannerImageWrapper}>
                <Image
                  src={banner.image}
                  alt={`${title} promotional banner`}
                  fill
                  className={styles.bannerImage}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  onError={(e) => {
                    console.error(`[${title}] Image failed to load:`, banner.image);
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/Outdoorlights.jpg'; // Fallback to existing image
                  }}
                  onLoad={() => {
                    console.log(`[${title}] Image loaded successfully:`, banner.image);
                  }}
                />
              </div>
              <div className={styles.bannerOverlay}>
                <ArrowRight className={styles.bannerArrow} size={24} />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Subheading */}
      <motion.div 
        className={styles.subheadingWrapper}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Star className={styles.subheadingIcon} size={24} />
        <h3 className={styles.subheading}>Best deals on {title}</h3>
        <div className={styles.subheadingLine} />
      </motion.div>
      
      {/* Product Grid */}
      <motion.div 
        className={styles.productGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <SimplifiedProductCard
                id={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                oldPrice={product.oldPrice}
                discount={product.discount}
                tag={product.tag}
                soldInfo={product.soldInfo}
              />
            </motion.div>
          ))
        ) : (
          <p className={styles.emptyMessage}>No products available for {title}</p>
        )}
      </motion.div>

      {/* View All Button */}
      <motion.div 
        className={styles.viewAllWrapper}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Link href={viewAllLink} className={styles.viewAllButton}>
          <span>View All {title}</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowRight className={styles.arrowIcon} size={20} />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
};

export default FetchedCategorySection;
