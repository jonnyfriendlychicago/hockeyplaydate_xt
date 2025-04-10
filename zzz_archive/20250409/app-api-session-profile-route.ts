// app/api/session-profile/route.ts
// Used by middleware to check if the current user’s userProfile is complete (has givenName and familyName).
// 2025apr09: this version completely failing, needs overhaul; being replaced now
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { syncUserFromAuth0 } from '@/lib/syncUser';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const dbUser = await syncUserFromAuth0(user); // ensure up-to-date
  
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
    select: { givenName: true, familyName: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}
