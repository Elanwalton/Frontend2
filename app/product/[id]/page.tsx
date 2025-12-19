import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import Breadcrumbs from '../../components/Breadcrumbs';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
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
  }[];
  badges?: string[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sunleaftechnologies.co.ke';

async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/getProductDetails.php?id=${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    
    console.log('Raw API response:', data);
    console.log('Product data structure:', data.data);
    
    if (!data.success) {
      throw new Error(data.message || 'Product not found');
    }

    const product = data.data;
    
    // Debug each field before parsing
    console.log('Images field type:', typeof product.images, 'Value:', product.images);
    console.log('Highlights field type:', typeof product.highlights, 'Value:', product.highlights);
    console.log('Specifications field type:', typeof product.specifications, 'Value:', product.specifications);
    
    // Helper function to safely parse JSON fields
const safeParseJSON = (value: any): any[] => {
  console.log('safeParseJSON input:', value, 'type:', typeof value);
  
  if (Array.isArray(value)) {
    console.log('Value is already array');
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      console.log('Parsed string to:', parsed, 'isArray:', Array.isArray(parsed));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.log('Failed to parse string, error:', e);
      return [];
    }
  }
  if (typeof value === 'object' && value !== null) {
    // Convert object to array of {label, value} pairs
    const converted = Object.entries(value).map(([key, val]) => ({
      label: key,
      value: String(val)
    }));
    console.log('Converted object to array:', converted);
    return converted;
  }
  console.log('Returning empty array for value:', value);
  return [];
};

// Normalize product data to match expected interface
    return {
      id: product.id.toString(),
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
      discount: product.discount_percentage ? parseFloat(product.discount_percentage) : undefined,
      rating: parseFloat(product.rating) || 0,
      reviewCount: parseInt(product.review_count) || 0,
      images: safeParseJSON(product.images),
      description: product.description || '',
      highlights: safeParseJSON(product.highlights),
      inStock: product.stock_quantity > 0,
      stockCount: parseInt(product.stock_quantity) || 0,
      colors: safeParseJSON(product.colors),
      sizes: safeParseJSON(product.sizes),
      specifications: safeParseJSON(product.specifications),
      reviews: safeParseJSON(product.reviews),
      badges: safeParseJSON(product.badges),
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.name, href: `/product/${product.id}` }
        ]}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
