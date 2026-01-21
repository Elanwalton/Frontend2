import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignore static assets, next internals, and api calls
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Extensions like .png, .jpg, .ico
  ) {
    return NextResponse.next();
  }

  // Check for redirects via Backend API
  try {
    // We use fetch to call our PHP backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/frontend2-dev/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    
    const checkUrl = `${baseUrl}/api/checkRedirect.php?path=${encodeURIComponent(pathname)}`;
    
    // Set a short timeout (1.5s) to avoid blocking navigation if API is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); 

    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.redirect && data.to) {
        // Perform the redirect
        // Handle 301 (Permanent) vs 302/307 (Temporary)
        const status = data.type === '301' || data.type === 301 ? 301 : 307;
        return NextResponse.redirect(new URL(data.to, request.url), status);
      }
    }
  } catch (error) {
    // Fail silently and continue navigation
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
