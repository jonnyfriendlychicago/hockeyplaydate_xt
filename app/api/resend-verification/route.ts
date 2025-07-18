// app/api/resend-verification/route.ts

import { NextResponse } from 'next/server';
import { ManagementClient } from 'auth0'; // npm install auth0
import { prisma } from '@/lib/prisma'; 
import { auth0 } from '@/lib/auth0';

export async function POST(req: Request) {
  try {
    // Check if user is already authenticated - if so, they don't need verification emails
    const session = await auth0.getSession();
    if (session?.user) {
      return NextResponse.json(
        { error: 'You are already logged in and verified' },
        { status: 400 }
      );
    }
    
    const { 
      // email, 
      // auth0Id, 
      presentableId 
    } = await req.json();

    if (
      // !email || 
      // !auth0Id || 
      !presentableId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get and validate the record
    const record = await prisma.loginFailure.findUnique({
      where: { presentableId }
    });

    // error if no record
    if (!record) {
      return NextResponse.json(
        { error: 'Invalid request' }, 
        { status: 404 }
      );
    }

    // error if record already used for email resend
    if (record.verifyEmailResent) {
      return NextResponse.json(
        { error: 'Verification email already sent' }, 
        { status: 400 }
      );
    }

    // error if login_error expired (for purposes of resending email)
    const pageLifeSpanHours = 24;
    const pageExpiration = new Date(record.createdAt.getTime() + (pageLifeSpanHours * 60 * 60 * 1000));
    const now = new Date();

    if (now > pageExpiration) {
      return NextResponse.json(
        { error: 'Request has expired' }, 
        { status: 410 }
      );
    }

    // Extract email and auth0Id from the database record (for next validation and downstream api function)
    const { email, auth0Id } = record;

    if (!email || !auth0Id) {
      return NextResponse.json(
        { error: 'Invalid record data' },
        { status: 500 }
      );
    }

    // error if lifetime resend limit reached (only two resends allowed, which in combination with original sent upon sign-up = 3 total verification emamils sent)
    const totalResends = await prisma.loginFailure.count({
      where: { 
        email: email.toLowerCase(),
        verifyEmailResent: true 
      }
    });

    if (totalResends > 2) {
      return NextResponse.json(
        { error: 'Maximum resend attempts reached for this email address' },
        { status: 429 }
      );
    }

    // Initialize Auth0 Management API client
    // below strips 'https://' from the existing .env.local domain, b/c Management SDK expects this stripped down string
    const fixedAuth0Domain = process.env.AUTH0_DOMAIN!.replace(/^https?:\/\//, '');
    const management = new ManagementClient({
    //   domain: process.env.AUTH0_DOMAIN!,
      domain: fixedAuth0Domain , 
      clientId: process.env.AUTH0_M2M_CLIENT_ID!,
      clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET!
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