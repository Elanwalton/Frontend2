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
  const siteBase = apiRoot ? apiRoot.replace(/\/?api$/i, '') : '';

  const candidateBase = mediaBase || siteBase;

  if (candidateBase) {
    return `${candidateBase}/${normalized}`;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/${normalized}`;
  }

  return `/${normalized}`;
};
