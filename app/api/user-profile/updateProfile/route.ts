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

  // (0) validate authentication
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      authUser: {
        auth0Id: sessionUser.sub,
      },
    },
    include: {
      authUser: true, // gets the related login email, etc.
    },
  });
  
  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }
  
  // (1) Server-side validation with Zod
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

  // (2a) - backend validation: email
  // set altEmail to null if value incoming from form is the same as login email
  if (parsed.altEmail && parsed.altEmail.toLowerCase() === dbUser.email.toLowerCase()) {
    parsed.altEmail = null;
  }

  // make sure altEmail unique among auth_user.id (i.e. email) as well as unique among user_profile.altEmail
  if (parsed.altEmail) {
    const alt = parsed.altEmail.toLowerCase();

    // Must not match altEmail of any other user_profile
    const altMatchInProfile = await prisma.userProfile.findFirst({
      where: {
        altEmail: alt,
        NOT: {
          userId: dbUser.id,
        },
      },
    });

    if (altMatchInProfile) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: [
            {
              field: 'altEmail',
              message: 'That email address is already in use. UP',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Must not match login email of any auth_user
    const altMatchInAuth = await prisma.authUser.findFirst({
      where: {
        email: alt,
        NOT: {
          id: dbUser.id,
        },
      },
    });

    if (altMatchInAuth) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: [
            {
              field: 'altEmail',
              message: 'That email address is already in use. AU',
            },
          ],
        },
        { status: 400 }
      );
    }

    // Normalize casing if valid
    parsed.altEmail = alt;}

    // (2b) - backend validation: vanitySlug
    if (parsed.slugVanity) {
      const slug = parsed.slugVanity.toLowerCase();
      // const defaultSlug = dbUser.slugDefault.toLowerCase();
      const defaultSlug = userProfile.slugDefault.toLowerCase(); 
    
      // Case 1: User tried to set slugVanity = slugDefault, so discard
      if (slug === defaultSlug) {
        parsed.slugVanity = null;
      } else {
        // Case 2: Check uniqueness across slugVanity and slugDefault (excluding self)
        const existing = await prisma.userProfile.findFirst({
          where: {
            OR: [
              { slugVanity: slug },
              { slugDefault: slug },
            ],
            NOT: { userId: dbUser.id },
          },
        });
    
        if (existing) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              issues: [
                {
                  field: 'slugVanity',
                  message: 'That custom profile URL is already taken. Please try another.',
                },
              ],
            },
            { status: 400 }
          );
        }
    
        // Valid, so normalize before save
        parsed.slugVanity = slug;
      }
    }
    
  // (3) Sanitize nullable fields (this step is legacy, leaving for future reference)
  const payload = {
    ...parsed,
    // slugVanity: parsed.slugVanity?.trim() || null,
    // altNickname: parsed.altNickname?.trim() || null,
    // altEmail: parsed.altEmail?.trim() || null,
    // phone: parsed.phone?.trim() || null,
    // note: above trim, then set to null if empty has been moved to zodSchema
    // this section reserved for any additional unforeseen post-Zod data manipulation
  };
  
  // (4) run the update
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