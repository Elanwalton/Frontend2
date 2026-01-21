import { MetadataRoute } from 'next'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
  : 'http://localhost/frontend2-dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sunleaftechnologies.co.ke';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Fetch products dynamically
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const productsResponse = await fetch(`${BACKEND_URL}/api/getProductsClients.php?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.success && Array.isArray(productsData.data)) {
        productPages = productsData.data.map((product: any) => ({
          url: `${baseUrl}/product/${product.slug || product.id}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.9,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Fetch categories dynamically
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categoriesResponse = await fetch(`${BACKEND_URL}/api/getCategories.php`, {
      next: { revalidate: 3600 },
    });
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success && Array.isArray(categoriesData.data)) {
        categoryPages = categoriesData.data.map((category: any) => ({
          url: `${baseUrl}/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
