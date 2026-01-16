/**
 * Direct PHP API URL helper
 * Always calls PHP backend directly
 */

export function getApiUrl(endpoint: string): string {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanEndpoint = endpoint.replace(/^\/+api\/+/, '').replace(/^\/+/, ''); // Remove leading /api/ and any leading /
  const phpPath = cleanEndpoint.endsWith('.php') ? cleanEndpoint : `${cleanEndpoint}.php`;
  return backendUrl ? `${backendUrl}/api/${phpPath}` : `/api/${phpPath}`;
}

/**
 * Get the base API URL for PHP backend
 */
export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')
  );
}

/**
 * Build full API URL with query parameters
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  const url = getApiUrl(endpoint);
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    return `${url}?${queryString}`;
  }
  return url;
}
