const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = 'http://127.0.0.1/frontend2-dev/api';
const SITE_BASE_URL = 'https://sunleaftechnologies.co.ke';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Helper to fetch data
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject('Failed to parse JSON');
        }
      });
    }).on('error', (err) => reject(err));
  });
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  try {
    const urls = [];

    // 1. Static Routes
    const staticRoutes = [
      '',
      '/categories',
      '/about',
      '/contact'
    ];
    
    staticRoutes.forEach(route => {
      urls.push({
        loc: `${SITE_BASE_URL}${route}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: route === '' ? '1.0' : '0.8'
      });
    });

    // 2. Fetch Products
    // Fetch all products (limit 1000 for now)
    const productsUrl = `${API_BASE_URL}/getProductsClients.php?limit=1000`;
    console.log(`Fetching products from: ${productsUrl}`);
    const productsRes = await fetchData(productsUrl);
    
    if (productsRes.success && Array.isArray(productsRes.data)) {
      productsRes.data.forEach(product => {
        const slug = product.slug || product.id;
        urls.push({
          loc: `${SITE_BASE_URL}/product/${slug}`,
          lastmod: new Date().toISOString(), // In real app, use product.updated_at
          changefreq: 'daily',
          priority: '0.9'
        });
      });
      console.log(`Added ${productsRes.data.length} products.`);
    }

    // 3. Categories (Hardcoded list or fetch if API exists)
    // We have internal IDs mapped to slugs.
    const categories = [
      'inverters',
      'batteries',
      'solar-panels',
      'solar-outdoor-lights',
      'mounting-accessories'
    ];
    
    categories.forEach(slug => {
       urls.push({
          loc: `${SITE_BASE_URL}/category/${slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.8'
       });
    });
    
    // 4. Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(OUTPUT_FILE, xml);
    console.log(`Sitemap generated at: ${OUTPUT_FILE}`);
    console.log(`Total URLs: ${urls.length}`);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
