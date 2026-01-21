'use client';
import { buildMediaUrl } from '@/utils/media';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sun, Battery, Zap, Droplets, Wrench, Sparkles, ArrowRight } from 'lucide-react';
import styles from '@/styles/ProductCategory.module.css';

const ProductCategories = () => {
  const router = useRouter();

  const categories = [
    {
      id: 'solar-panels',
      name: 'Solar Panels',
      image: buildMediaUrl('images/Original-suntree-solar-accessories-in-nairobi-kenya.jpg'),
      alt: 'High-efficiency solar panels for renewable energy generation',
      icon: Sun,
      color: '#f7c843',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'batteries',
      name: 'Batteries',
      image: buildMediaUrl('images/BYD-BATTERY-BOX.webp'),
      alt: 'Energy storage batteries for solar power systems',
      icon: Battery,
      color: '#059669',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'inverters',
      name: 'Inverters',
      image: buildMediaUrl('images/growatt-solar-inverters-1.jpg'),
      alt: 'Solar inverters for power conversion',
      icon: Zap,
      color: '#2563eb',
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: buildMediaUrl('images/solar-water-pumping-inverters-for-sale-in-nairobi-kenya.webp'),
      alt: 'Solar system accessories and installation components',
      icon: Wrench,
      color: '#7c3aed',
      gradient: 'from-purple-500 to-violet-600'
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    // Map category IDs to proper category names for the API
    const categoryMap: Record<string, string> = {
      'solar-panels': 'solar panels',
      'batteries': 'Batteries',
      'inverters': 'Inverters',
      'accessories': 'Mounting Accesories'
    };
    
    const categoryName = categoryMap[categoryId] || categoryId;
    router.push(`/categories?category=${encodeURIComponent(categoryName)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.titleWrapper}>
            <Sparkles className={styles.sparkleIcon} size={32} />
            <h2 className={styles.title}>Explore Our Categories</h2>
          </div>
          <p className={styles.subtitle}>Premium solar energy solutions for every need</p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          className={styles.categoriesGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.id}
                className={styles.categoryCard}
                variants={itemVariants}
                whileHover={{ 
                  y: -12,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryClick(category.id);
                  }
                }}
              >
                {/* Glow Effect */}
                <div 
                  className={styles.cardGlow}
                  style={{ background: category.color }}
                />

                {/* Icon Badge */}
                <motion.div 
                  className={styles.iconBadge}
                  style={{ background: category.color }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <IconComponent size={24} className={styles.badgeIcon} />
                </motion.div>

                {/* Octagon Image */}
                <div className={styles.octagonWrapper}>
                  <div className={styles.imageOverlay} />
                  <img
                    src={category.image}
                    alt={category.alt}
                    className={styles.categoryImage}
                  />
                  <motion.div 
                    className={styles.hoverArrow}
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </div>

                {/* Category Name */}
                <p className={styles.categoryName}>{category.name}</p>
                
                {/* Hover Indicator */}
                <motion.div 
                  className={styles.hoverIndicator}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                  style={{ background: category.color }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductCategories;
