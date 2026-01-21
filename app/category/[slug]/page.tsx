import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CategoryProducts from '@/components/CategoryProducts';

// Interface for Category API Response
interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  schema_markup: any;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : 'https://sunleaftechnologies.co.ke';

// Legacy ID mapping for CategoryProducts component
const CATEGORY_ID_MAP: Record<string, string> = {
  'inverters': 'Inverters',
  'batteries': 'Batteries',
  'solar-panels': 'solar panels',
  'solar-outdoor-lights': 'Solar Outdoor Lights',
  'mounting-accessories': 'Mounting Accesories' // Typo in original component maintained here
};

async function getCategory(slug: string): Promise<CategoryData | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/getCategoryDetails.php?slug=${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found | Sunleaf Technologies',
    };
  }

  return {
    title: category.meta_title || `${category.name} | Sunleaf Technologies`,
    description: category.meta_description || `Shop ${category.name} at Sunleaf Technologies.`,
    keywords: category.keywords,
    alternates: {
      canonical: `https://sunleaftechnologies.co.ke/category/${category.slug}`,
    },
    openGraph: {
      title: category.meta_title || `${category.name} | Sunleaf Technologies`,
      description: category.meta_description || `Shop ${category.name} at Sunleaf Technologies.`,
      url: `https://sunleaftechnologies.co.ke/category/${category.slug}`,
      type: 'website',
      locale: 'en_KE',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.meta_title || `${category.name} | Sunleaf Technologies`,
      description: category.meta_description || `Shop ${category.name} at Sunleaf Technologies.`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  // Get the internal ID used by CategoryProducts component
  // If no map found, assume the slug might match directly or pass it as is (logic in component will fallback)
  const internalId = CATEGORY_ID_MAP[category.slug] || category.name; 

  return (
    <>
      {/* Inject Schema.org JSON-LD */}
      {category.schema_markup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(category.schema_markup) }}
        />
      )}
      
      {/* Render existing component with pre-selected category */}
      <CategoryProducts initialCategory={internalId} />
    </>
  );
}
