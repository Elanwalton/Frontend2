export const buildMediaUrl = (rawPath?: string | null, fallback: string = '/images/placeholder.jpg'): string => {
  if (!rawPath) {
    return fallback;
  }

  const trimmed = typeof rawPath === 'string' ? rawPath.trim() : '';
  if (!trimmed) {
    return fallback;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.replace(/^\/+/, '');

  const mediaBaseRaw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '';
  const apiBaseRaw = process.env.NEXT_PUBLIC_API_URL || '';

  const sanitizeBase = (value: string) => value.replace(/\/+$/, '');

  const mediaBase = mediaBaseRaw ? sanitizeBase(mediaBaseRaw) : '';
  const apiRoot = apiBaseRaw ? sanitizeBase(apiBaseRaw) : '';
  
  // For images, always prefer the API domain - don't strip /api from it
  const candidateBase = mediaBase || apiRoot;

// Smart check: Only use candidateBase if the path looks like backend media
  const isBackendMedia = /^(products\/|images\/(hero|category_banners|profiles)\/|profiles\/)/i.test(normalized);

  if (candidateBase && isBackendMedia) {
    // If the base URL ends with /images and the path starts with images/, 
    // remove the redundant images/ prefix from the path
    let finalPath = normalized;
    if (candidateBase.endsWith('/images') && normalized.startsWith('images/')) {
      finalPath = normalized.replace(/^images\//, '');
    }
    return `${candidateBase}/${finalPath}`;
  }

  // Hardcoded fallback for production - always use API domain with /public
  const productionFallback = 'https://api.sunleaftechnologies.co.ke/public';
  
  if (typeof window !== 'undefined') {
    // Check if we're in production (on Vercel)
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('sunleaftechnologies.co.ke')) {
      return `${productionFallback}/${normalized}`;
    }
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/${normalized}`;
  }

  return `/${normalized}`;
};
