/**
 * API Client Utility
 * Direct PHP backend calls for all environments
 */

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Get the API endpoint URL
 * Always calls PHP backend directly
 */
export function getApiEndpoint(path: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/sunleaf-tech';
  const phpPath = path.endsWith('.php') ? path : `${path}.php`;
  return `${backendUrl}/api/${phpPath.replace('/api/', '')}`;
}

/**
 * Fetch wrapper for direct PHP backend calls
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  // Build URL with query parameters
  let url = getApiEndpoint(endpoint);
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url = `${url}?${searchParams.toString()}`;
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers);
  }
  
  async function doFetch(withRetry: boolean): Promise<T> {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: fetchOptions.credentials ?? 'include',
    });

    if (response.status === 401 && withRetry) {
      // Attempt a single refresh, then retry original request once
      try {
        await fetch(getApiEndpoint('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        console.error('Token refresh failed:', e);
        throw new Error('Unauthenticated');
      }

      // Retry original request once without further refresh attempts
      return doFetch(false);
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  }

  try {
    return await doFetch(true);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET', params });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    params,
  });
}
