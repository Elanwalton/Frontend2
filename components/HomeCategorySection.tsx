"use client";
import React, { useEffect, useState } from "react";
import ProductCard from '@/components/ProductCard';
import sectionStyles from '@/styles/HomeSections.module.css';

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

interface HomeCategorySectionProps {
  title: string;
  href: string;
  bannerImage?: string;
  fetchUrl: string;
  emptyMessage: string;
}

const HomeCategorySection: React.FC<HomeCategorySectionProps> = ({
  title,
  href,
  bannerImage,
  fetchUrl,
  emptyMessage,
}) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeParseJson = (raw: string) => {
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
      throw new Error("Unable to locate JSON in response");
    } catch (e: any) {
      return { data: [] };
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(fetchUrl, { credentials: "include" });
        const raw = await res.text();
        const data = safeParseJson(raw);
        const mapped: Product[] = (data?.data || []).map((item: any) => ({
          id: Number(item.id),
          image: String(item.main_image_url).startsWith("http")
            ? String(item.main_image_url)
            : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/?api\/?$/i, "")}/${item.main_image_url}`,
          title: item.name,
          price: Number(item.price),
          category: item.category || "Uncategorized",
          rating: item.rating ? parseFloat(item.rating) : 0,
          reviews: item.review_count ? parseInt(item.review_count) : 0,
          stock: item.stock_quantity !== undefined ? parseInt(item.stock_quantity) : undefined,
          description: item.description || item.short_description || undefined,
        }));
        if (!cancelled) setItems(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load section");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchUrl]);

  return (
    <section className={sectionStyles.section}>
      {bannerImage && (
        <a href={href} className={sectionStyles.thumbWrapper}>
          <img src={bannerImage} alt={`${title} banner`} className={sectionStyles.thumbImage} />
        </a>
      )}
      <div className={sectionStyles.sectionHeader}>
        <h2 className={sectionStyles.sectionTitle}>{title}</h2>
        <a href={href} className={sectionStyles.sectionLink}>View all</a>
      </div>
      <div className={sectionStyles.grid}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={sectionStyles.skeleton} />
            ))
          : items.length > 0
            ? items.map((p) => <ProductCard key={p.id} product={p} />)
            : <p className={sectionStyles.fullRowMessage}>{emptyMessage}</p>}
      </div>
      {error && <p className={sectionStyles.error}>We're showing limited items while products load.</p>}
    </section>
  );
};

export default HomeCategorySection;
