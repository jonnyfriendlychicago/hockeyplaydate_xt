// app/api/user-profile/update-name/route.ts
// this function called by: components/onboarding/ProfileNameForm.tsx
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// API route to update givenName + familyName in the user_profile table
export async function POST(req: Request) {
// above replaces below, is this correct?
// export async function PATCH(req: Request) {

  // Get the current session using Auth0 helper
  const session = await auth0.getSession();
  const user = session?.user;

  // If no session or user is found, the user is not logged in.  How did they get here in the first place, right? 
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Parse JSON body of the request to get updated name values, will use this in a moment
  const { givenName, familyName } = await req.json();

  // Find the corresponding AuthUser record in the database using the Auth0 `sub` ID
  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: user.sub },
  });

   // If no authUser found, return an error
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 2025apr10: ixnay on below, return to this later 
  // Basic validation: both fields are required
  // if (!givenName || !familyName) {
  //   return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  // }

  // Update the related userProfile row with the new name values
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
