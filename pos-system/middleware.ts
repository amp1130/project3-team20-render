import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware();

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Check if the request is for an API route
  if (path.startsWith('/api/')) {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    // Simple API key check (you should use a more robust solution in production)
    if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};