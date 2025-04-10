//middleware.ts
// source: https://auth0.com/docs/quickstart/webapp/nextjs/interactive
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

// above is original middleware file from quickstart
// temporarily commenting out this entire file; 

// middleware.ts
// import { auth0 } from './lib/auth0';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//   const session = await auth0.getSession(request);
//   const user = session?.user;

//   // If no logged-in user, allow access
//   if (!user) return NextResponse.next();

//   // Allow navigation to the onboarding page itself
//   if (request.nextUrl.pathname.startsWith('/onboarding/name')) {
//     return NextResponse.next();
//   }

//   // Call our API route to check the profile completeness
//   const res = await fetch(`${request.nextUrl.origin}/api/session-profile`, {
//     headers: {
//       cookie: request.headers.get('cookie') || '',
//     },
//   });

//   if (!res.ok) return NextResponse.next();

//   const profile = await res.json();

//   if (!profile?.givenName || !profile?.familyName) {
//     return NextResponse.redirect(new URL('/onboarding/name', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
//   // matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/session-profile).*)',],
  
// };
