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

  // Hardcoded fallback for production - always use API domain
  const productionFallback = 'https://api.sunleaftechnologies.co.ke';
  const mediaBaseRaw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '';
  const apiBaseRaw = process.env.NEXT_PUBLIC_API_URL || '';
  const backendBaseRaw = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const sanitizeBase = (value: string) => value.replace(/\/+$/, '');

  const mediaBase = mediaBaseRaw ? sanitizeBase(mediaBaseRaw) : '';
  const apiRoot = apiBaseRaw ? sanitizeBase(apiBaseRaw) : '';
  const backendBase = backendBaseRaw ? sanitizeBase(backendBaseRaw) : '';
  
  // Order: Media > Backend > API > Fallback
  const candidateBase = mediaBase || backendBase || apiRoot || productionFallback;

  // Robust check for backend media:
  // 1. Starts with products/
  // 2. Starts with images/ and contains one of our known folders
  // 3. Starts with profiles/
  const isBackendMedia = /^(products\/|images\/(hero|category_banners|profiles|products|uploads)|profiles\/|uploads\/)/i.test(normalized);

  if (isBackendMedia) {
    let finalPath = normalized;
    // If the base URL ends with /images and the path starts with images/, 
    // remove the redundant images/ prefix from the path to avoid /images/images/
    if (candidateBase.toLowerCase().endsWith('/images') && normalized.toLowerCase().startsWith('images/')) {
      finalPath = normalized.replace(/^images\//i, '');
    }
    return `${candidateBase}/${finalPath}`;
  }

  // Frontend Assets Fallback
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/${normalized}`;
  }

  return `/${normalized}`;
};
