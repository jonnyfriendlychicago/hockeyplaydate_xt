// app/api/session-profile/route.ts
// Used by middleware to determine if the logged-in user has a completed profile (givenName + familyName).
// 2025apr09: this entire file no longer being used; but possibly has re-use options. 
import { auth0 } from '@/lib/auth0';
import { syncUserFromAuth0 } from '@/lib/syncUser';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth0.getSession();
    const auth0User = session?.user;

    if (!auth0User) {
      return NextResponse.json({ authenticated: false });
    }

    const dbUser = await syncUserFromAuth0(auth0User);

    if (!dbUser) {
      return NextResponse.json({ authenticated: true, hasProfile: false });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: dbUser.id },
    });

    const hasMinimalProfile = !!(profile?.givenName && profile?.familyName);

    return NextResponse.json({
      authenticated: true,
      hasProfile: hasMinimalProfile,
    });
  } catch (error) {
    console.error('Error in /api/session-profile:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
