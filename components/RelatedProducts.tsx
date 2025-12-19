"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import styles from '@/styles/RelatedProducts.module.css';
import { buildMediaUrl } from '@/utils/media';

interface Product {
  id: number;
  image: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  stock?: number;
  description?: string;
}

interface RelatedProductsProps {
  limit?: number;
  title?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  limit = 6, 
  title = "You Might Also Like" 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const RAW_API = process.env.NEXT_PUBLIC_API_URL || "";
  const API_BASE = RAW_API.replace(/\/?api\/?$/i, "");

  useEffect(() => {
    let cancelled = false;

    async function fetchRelatedProducts() {
      try {
        const response = await fetch(
          `${API_BASE}/api/getProductsClients.php?page=1&limit=${limit}`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (!cancelled) {
          const mappedProducts: Product[] = (data?.data || []).map((item: any) => ({
            id: Number(item.id),
            image: buildMediaUrl(item.main_image_full_url || item.main_image_url),
            title: item.name,
            price: Number(item.price),
            category: item.category || "Uncategorized",
            rating: item.rating ? parseFloat(item.rating) : 0,
            reviews: item.review_count ? parseInt(item.review_count) : 0,
            stock: item.stock_quantity !== undefined 
              ? parseInt(item.stock_quantity) 
              : (item.quantity !== undefined ? parseInt(item.quantity) : undefined),
            description: item.description || item.short_description || undefined,
          }));

          setProducts(mappedProducts);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load related products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRelatedProducts();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, limit]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              <Sparkles className={styles.titleIcon} size={32} />
              <h2 className={styles.title}>{title}</h2>
            </div>
            <p className={styles.subtitle}>Explore more amazing solar products</p>
          </div>
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <motion.section 
      className={styles.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <Sparkles className={styles.titleIcon} size={32} />
            <h2 className={styles.title}>{title}</h2>
          </div>
          <p className={styles.subtitle}>Explore more amazing solar products</p>
        </div>

        <div className={styles.grid}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div 
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button className={styles.viewAllBtn}>
            View All Products
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default RelatedProducts;
