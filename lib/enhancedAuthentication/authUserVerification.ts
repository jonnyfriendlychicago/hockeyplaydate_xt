// lib/enhancedAuthentication/authUserVerification.ts

import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserProfile, AuthUser } from '@prisma/client';

/**
 * Retrieves and verifies the full user profile associated with the authenticated user.
 * - Redirects to /auth/login if no session or auth_user is found.
 * - Redirects to / if no userProfile is found (should never happen under normal flows).
 * Returns the fully populated userProfile, including the related authUser object.
 */

//  Custom type for the joined profile with authUser relation included
type FullUserProfile = UserProfile & {
    authUser: AuthUser;
  };

export async function getAuthUserOrRedirect(): Promise<FullUserProfile> {
  const session = await auth0.getSession();
  const sessionUser = session?.user;

  // if not authenticated, must do so
  if (!sessionUser) {
    redirect('/auth/login');
  }

  // authUser record is created for user upon very first authentication/login, and repeated/synced for each subsequent login.  
  // no scenario wheren authUser record should not exist for this user; 
  // below this is a safe guard / double check
  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });

  if (!dbUser) {
    redirect('/auth/login');
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
    include: {
      authUser: true,
    },
  });

  // userProfile record is created / double-checked for existence upon first and all subsequent logins
  // below this is a safe guard / double check
  if (!userProfile) {redirect('/');}
  if (!userProfile.authUser) {redirect('/');} // added 2025jul09 to avert newfound Ts issue with nullable userProfile.authUser
  

  // below means userProfile is fully accessible by the importing page/component
  // return userProfile;
  return userProfile as FullUserProfile; // 2025jul09: replaces above to avert newfound Ts issue with nullable userProfile.authUser

}

/**
 * Placeholder: Extend this to verify the authenticated user is an organizer.
 * If not an organizer, redirect to login or access-denied page.
 */
export async function getAuthOrganizerOrRedirect() {
  throw new Error('getAuthOrganizerOrRedirect not yet implemented');
}

/**
 * Placeholder: Extend this to verify the authenticated user is an admin.
 * If not an admin, redirect to login or access-denied page.
 */
export async function getAuthAdminOrRedirect() {
  throw new Error('getAuthAdminOrRedirect not yet implemented');
}

