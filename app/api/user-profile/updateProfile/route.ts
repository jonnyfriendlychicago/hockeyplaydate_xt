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

  const { 
    altEmail, 
    phone, 
    slugVanity, 
    givenName, 
    familyName, 
    altNickname,
  
  } = await req.json();

  // ensure string of spaces definitely converted to null.  Essential to have this handled on back-end / route.ts
  const sanitizedSlugVanity =
  typeof slugVanity === 'string' && slugVanity.trim() !== ''
    ? slugVanity.trim()
    : null;

  const updated = await prisma.userProfile.update({
    where: { userId: dbUser.id },
    data: {
      altEmail,
      phone,
      // slugVanity,
      slugVanity: sanitizedSlugVanity,
      givenName,
      familyName,
      altNickname,
    },
    select: { // this object added: ensures these fields are returned in the update, even tho slugDefault isn't being touched. This ensures that attribute is accessible on the originating form/page. 
      slugDefault: true, 
      slugVanity: true
    }
  });

  return NextResponse.json(updated);
}
