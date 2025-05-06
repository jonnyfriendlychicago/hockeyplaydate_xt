// app/api/user-profile/updateProfile/route.ts
// this function called by: components/UserProfile/EditUserProfileForm.tsx
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { userProfileValSchema } from '@/lib/validation/userProfileValSchema';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  const session = await auth0.getSession();
  const sessionUser = session?.user;

  // validate authentication
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

// Server-side validation with Zod
let parsed;
  try {
    const body = await req.json();
    parsed = userProfileValSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  // Sanitize nullable fields
  const payload = {
    ...parsed,
    slugVanity: parsed.slugVanity?.trim() || null,
    altNickname: parsed.altNickname?.trim() || null,
    altEmail: parsed.altEmail?.trim() || null,
    phone: parsed.phone?.trim() || null,
  };
  
  // run the update
  const updated = await prisma.userProfile.update({
    where: { userId: dbUser.id },
    data: payload,
    select: {
      slugDefault: true,
      slugVanity: true,
    },
  });
  
  return NextResponse.json(updated);
}