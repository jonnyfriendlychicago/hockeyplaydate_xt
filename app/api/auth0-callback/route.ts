// app/api/auth0-callback/route.ts
// This route handles the custom Auth0 redirect for unverified users
// implemented 2025aug08

export const dynamic = 'force-dynamic'; // this silences a false alarm during 'npm run build': 
// Error in auth0-callback route: ... couldn't be rendered statically because it used `nextUrl.searchParams`
// What's happening:
// Next.js is trying to statically analyze your routes during build time, and it's warning that /api/auth0-callback can't be pre-rendered because it reads searchParams (which is dynamic). 
// This is totally normal and expected for API routes that handle query parameters.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    
    if (!state) {
      // No state parameter, redirect to generic error
      return NextResponse.redirect(new URL('/login-exception?code=missing_state', request.url));
    }

    // Decode the base64 state parameter
    let decodedState: string;
    try {
      decodedState = atob(state);
    } catch (error) {
      // Invalid base64, redirect to generic error
      console.log(error)
      return NextResponse.redirect(new URL('/login-exception?code=invalid_state', request.url));
    }

    // Parse the decoded state (format: email_verified:false|email:user@example.com|user_id:auth0|123456)
    // Note: user_id contains | character, so we need to be careful with parsing
    const emailVerifiedMatch = decodedState.match(/email_verified:([^|]+)/);
    const emailMatch = decodedState.match(/email:([^|]+)/);
    const userIdMatch = decodedState.match(/user_id:(.+)$/);

    if (!emailVerifiedMatch || !emailMatch || !userIdMatch) {
      return NextResponse.redirect(new URL('/login-exception?code=malformed_state', request.url));
    }

    const emailVerified = emailVerifiedMatch[1] === 'true';
    const email = emailMatch[1];
    const auth0Id = userIdMatch[1];

    // If email is actually verified, something's wrong - redirect to login
    if (emailVerified) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    // Call your existing login-error API to create the record
    const baseUrl = process.env.APP_BASE_URL;
    const internalApiUrl = process.env.INTERNAL_API_BASE_URL || process.env.APP_BASE_URL;
    
    if (!baseUrl || !internalApiUrl) {
      throw new Error("Required environment variables not set");
    }

    const response = await fetch(`${internalApiUrl}/api/login-error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        errorCode: "unverified_email", 
        email, 
        auth0Id 
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("login-error API failed:", response.status, text);
      return NextResponse.redirect(new URL('/login-exception?code=api_error', request.url));
    }

    const data = await response.json();
    
    if (!data.presentableId) {
      console.error("Missing presentableId in API response");
      return NextResponse.redirect(new URL('/login-exception?code=missing_presentable_id', request.url));
    }

    // Redirect to your existing login-error page
    return NextResponse.redirect(new URL(`/login-error/${data.presentableId}`, baseUrl));

  } catch (error) {
    console.error("Error in auth0-callback route:", error);
    return NextResponse.redirect(new URL('/login-exception?code=callback_error', request.url));
  }
}