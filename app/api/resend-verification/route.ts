// app/api/resend-verification/route.ts

import { NextResponse } from 'next/server';
import { ManagementClient } from 'auth0'; // npm install auth0
import { prisma } from '@/lib/prisma'; 

export async function POST(req: Request) {
  try {
    const { email, auth0Id, presentableId } = await req.json();

    if (!email || !auth0Id || !presentableId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Auth0 Management API client
    // below strips 'https://' from the existing .env.local domain, b/c Management SDK expects this stripped down string
    const fixedAuth0Domain = process.env.AUTH0_DOMAIN!.replace(/^https?:\/\//, '');
    const management = new ManagementClient({
    //   domain: process.env.AUTH0_DOMAIN!,
      domain: fixedAuth0Domain , 
      clientId: process.env.AUTH0_M2M_CLIENT_ID!,
      clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET!,
    //   scope: 'update:users' // explanation on commOut: The scope (update:users) will be set when you configure the Machine-to-Machine application in the Auth0 Dashboard - that's where you grant it the necessary permissions, not in the code.
    });

    // Resend verification email (heck yeah!)
    await management.jobs.verifyEmail({
      user_id: auth0Id,
    });

    // Mark this login_error as having been used for resend
    await prisma.loginFailure.update({
      where: { 
        presentableId: presentableId 
      },
      data: { 
        verifyEmailResent: true 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    
    // Handle specific Auth0 errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('user not found')) {
        return NextResponse.json(
          { error: 'User not found.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}