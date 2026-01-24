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

  // Hardcoded fallbacks for production
  const productionFallback = 'https://api.sunleaftechnologies.co.ke';
  const productionMediaBase = 'https://api.sunleaftechnologies.co.ke/images';

  const mediaBaseRaw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '';
  const apiBaseRaw = process.env.NEXT_PUBLIC_API_URL || '';
  const backendBaseRaw = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  // Sanitize: trim and remove trailing slashes
  const sanitizeBase = (value: string) => value.trim().replace(/\/+$/, '');

  const mediaBase = mediaBaseRaw ? sanitizeBase(mediaBaseRaw) : '';
  const apiRoot = apiBaseRaw ? sanitizeBase(apiBaseRaw) : '';
  const backendBase = backendBaseRaw ? sanitizeBase(backendBaseRaw) : '';
  
  // Decide the best candidate base for media
  // If we have NEXT_PUBLIC_MEDIA_BASE_URL, use it.
  // Otherwise try to derive it from API URL or Backend URL.
  let candidateBase = mediaBase;
  if (!candidateBase) {
    if (backendBase) candidateBase = `${backendBase}/images`;
    else if (apiRoot) candidateBase = apiRoot.replace(/\/api$/, '') + '/images';
    else candidateBase = productionMediaBase;
  }

  // Robust check for backend media:
  // If the path contains any of these markers, it's likely from our backend
  const normalizedLower = normalized.toLowerCase();
  const indicators = [
    'products/',
    'profiles/',
    'hero/',
    'category_banners/',
    'uploads/',
    'images/products/',
    'images/hero/',
    'images/category_banners/',
    'images/profiles/',
    'images/uploads/',
  ];
  
  const isBackendMedia = indicators.some(ind => normalizedLower.includes(ind)) || 
                         normalizedLower.startsWith('products/');

  if (isBackendMedia) {
    let finalPath = normalized;
    
    // Clean redundant prefixes
    // Case 1: Base is .../images and path starts with images/
    const sanitizedCandidate = sanitizeBase(candidateBase);
    if (sanitizedCandidate.toLowerCase().endsWith('/images') && normalizedLower.startsWith('images/')) {
      finalPath = normalized.replace(/^images\//i, '');
    }
    
    // Case 2: Base doesn't have /images but path starts with it
    // (This shouldn't happen with our derivation above, but just in case)
    
    return `${sanitizedCandidate}/${finalPath}`;
  }

  // Frontend Assets (in /public folder)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    // Ensure we don't accidentally return the API domain for local local assets
    return `${origin}/${normalized}`;
  }

  return `/${normalized}`;
};
