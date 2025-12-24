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

  if (candidateBase) {
    return `${candidateBase}/${normalized}`;
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
