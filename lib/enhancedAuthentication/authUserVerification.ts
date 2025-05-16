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
//  export async function getAuthUserOrRedirect() {
  const session = await auth0.getSession();
  const sessionUser = session?.user;

  if (!sessionUser) {
    redirect('/auth/login');
  }

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

  if (!userProfile) {
    redirect('/');
  }

  return userProfile;
}

/**
 * Placeholder: Extend this to verify the authenticated user is an admin.
 * If not an admin, redirect to login or access-denied page.
 */
export async function getAuthAdminOrRedirect() {
  throw new Error('getAuthAdminOrRedirect not yet implemented');
}

/**
 * Placeholder: Extend this to verify the authenticated user is an organizer.
 * If not an organizer, redirect to login or access-denied page.
 */
export async function getAuthOrganizerOrRedirect() {
  throw new Error('getAuthOrganizerOrRedirect not yet implemented');
}
