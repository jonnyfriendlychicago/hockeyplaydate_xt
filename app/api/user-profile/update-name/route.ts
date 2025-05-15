// app/api/user-profile/update-name/route.ts
// this function called by: components/UserProfile/EdiUserProfileNameForm.tsx
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { userProfileNameValSchema } from '@/lib/validation/userProfileNameValSchema';

export async function POST(req: Request) {
  // Get the current session using Auth0 helper
  const session = await auth0.getSession();
  const sessionUser = session?.user;
  // If no session or user is found, the user is not logged in.  How did they get here in the first place, right? 
  if (!sessionUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Find the corresponding AuthUser record in the database using the Auth0 `sub` ID
  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });
  // If no authUser found, return an error
 if (!dbUser) {
   return NextResponse.json({ error: 'User not found' }, { status: 404 });
 }

//  const { givenName, familyName } = await req.json(); // Parse JSON body of the request to get updated name values, will use this in a moment
 // above replaced by below
   // Validate and sanitize input using Zod
   let parsed;
   try {
     const body = await req.json();
     parsed = userProfileNameValSchema.parse(body);
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


  // // Update the related userProfile record with the new name values
  // const updatedProfile = await prisma.userProfile.update({
  //   where: { userId: dbUser.id },
  //   data: {
  //     givenName,
  //     familyName,
  //   },
  // });

    // Save cleaned + validated name values
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: dbUser.id },
      data: {
        givenName: parsed.givenName,
        familyName: parsed.familyName,
      },
    });
    
  // Return updatedProfile object
  return NextResponse.json(updatedProfile);
}
