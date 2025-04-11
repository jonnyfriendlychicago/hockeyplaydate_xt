// app/api/user-profile/updateProfile/route.ts
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: user.sub },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { altEmail, phone, slugVanity, givenName, familyName } = await req.json();

  const updated = await prisma.userProfile.update({
    where: { userId: dbUser.id },
    data: {
      altEmail,
      phone,
      slugVanity,
      givenName,
      familyName,
    },
  });

  return NextResponse.json(updated);
}
