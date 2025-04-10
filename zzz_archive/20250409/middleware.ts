// // middleware.ts

// // 2025apr09: this entire file contents deprecated.  Several fatal flaws.  Transitioning now to reading cookie and taking actions based on contents. 

// // 2025apr09: BEGIN: All of below replaced by section below. 
// // All of below is boilerplate template from https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// // additional documentation: https://github.com/auth0/nextjs-auth0
// // import type { NextRequest } from "next/server";
// // import { auth0 } from "./lib/auth0";

// // export async function middleware(request: NextRequest) {
// //   return await auth0.middleware(request);
// // }
// // 2025apr09: END: All of below replaced by section below. 

// import { auth0 } from '/lib/auth0';
// import { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';
// import { prisma } from './lib/prisma';

// export async function middleware(request: NextRequest) {
//   // set up variables
//   const session = await auth0.getSession(request); // Get the current Auth0 session based on the request (reads from the cookie)
//   const user = session?.user; // Auth0 session contains the authenticated user (if logged in)

//   // If not logged in, allow the request to continue without any restrictions
//   if (!user) return NextResponse.next();

//   // Look up the user in your own database by Auth0 ID
//   const dbUser = await prisma.authUser.findUnique({
//     where: { auth0Id: user.sub }, // Auth0 `sub` is the unique ID
//   });

//   // If somehow the user isn't in your DB, let the request through
//   if (!dbUser) return NextResponse.next();

//   // Find the corresponding userProfile record (linked by userId)
//   const userProfile = await prisma.userProfile.findUnique({
//     where: { userId: dbUser.id },
//   });

//   // Get the current pathname of the request (e.g., "/members" or "/onboarding/name")
//   const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding/name');

//   // If the user is missing name fields AND they're not already on the onboarding page
//   if (!isOnboardingPage && (!userProfile?.givenName || !userProfile?.familyName)) {
//     // Clone the request URL and redirect to /onboarding/name
//     const onboardingUrl = request.nextUrl.clone();
//     onboardingUrl.pathname = '/onboarding/name';
//     return NextResponse.redirect(onboardingUrl);
//   }

//   // Everything looks good — allow request to continue
//   return NextResponse.next();
// }

// // all of below is standard boilerplate, affirmed by various sources. 
// export const config = {
//   matcher: [
//     /*Match all request paths except for the ones starting with: _next/static (static files), _next/image (image optimization files), favicon.ico, sitemap.xml, robots.txt (metadata files)*/
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
//   ],
// };