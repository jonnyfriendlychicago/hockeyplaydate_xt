// app/api/user-profile/update-name/route.ts
// this function called by: components/UserProfile/EdiUserProfileNameForm.tsx
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {

  // Get the current session using Auth0 helper
  const session = await auth0.getSession();
  const sessionUser = session?.user;

  // If no session or user is found, the user is not logged in.  How did they get here in the first place, right? 
  if (!sessionUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Parse JSON body of the request to get updated name values, will use this in a moment
  const { givenName, familyName } = await req.json();

  // Find the corresponding AuthUser record in the database using the Auth0 `sub` ID
  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });

   // If no authUser found, return an error
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Update the related userProfile record with the new name values
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: dbUser.id },
    data: {
      givenName,
      familyName,
    },
  });

  // Return updatedProfile object
  return NextResponse.json(updatedProfile);
}
