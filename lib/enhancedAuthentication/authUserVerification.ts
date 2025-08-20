// lib/enhancedAuthentication/authUserVerification.ts

import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserProfile, AuthUser } from '@prisma/client';

// ********** OVERVIEW: BEGIN ************************
// This file validates: 
// (1) user is authenticated
// (2) existence of essential db records/data for the authenticated user
// (3) existence of any data/flags that preclude system access

// ... and redirects for any fatal scenarios. 
// Absent that, returns fully populated userProfile, including the related authUser object.
 
// Note: parent files will invoke herein function and assign the return as follows: 

// const  authenticatedUser = await getAuthenticatedUser(); 

// ... and use of the string 'authenticatedUser' as variable is explained as: 
// this variable is not named 'authUser' ,  'authedUser' , etc., b/c that's easily confused with the db object 'authUser'.  
// this variable could have also gone with 'authenticatedUserProfile' which might have been more accurate and complete, but authenticatedUser is long enough already. 

// ********** OVERVIEW: END ************************


//  prereq: Declare custom type for the joined profile with authUser relation included
type FullUserProfile = UserProfile & {
    authUser: AuthUser;
  };

export async function getAuthenticatedUser(): Promise<FullUserProfile> { // we are gonnna rename this: getAuthenticatedUserProfileOrRedirect
  
// 1 - if not authenticated, redirect to login
  const authSession = await auth0.getSession();
  const authSessionUser = authSession?.user;

  if (!authSessionUser) {
    redirect('/auth/login');
  }

  // 2 - ensure auth_user record exists for user; else, redirect. 
  // this scenario should never occur, as authUser record is created for each user upon very first authentication/login, and repeated/synced for each subsequent login.  
  // below this is a safe guard / double check
  // 2025jul29: this entire check seems like silly overkill, but leave it for now, seemingly doesn't hurt
  const dbAuthUser = await prisma.authUser.findUnique({
    where: { auth0Id: authSessionUser.sub },
  });

  if (!dbAuthUser) {
    redirect('/auth/login');
  }

  // 3 - ensure user_profile record exists for user; else, redirect. 
  // this scenario should never occur, as userProfile record is created for each user upon very first authentication/login. 
  // below this is a safe guard / double check
  // 2025jul29: this entire check seems like silly overkill, but leave it for now, seemingly doesn't hurt
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: dbAuthUser.id },
    include: {
      authUser: true,
    },
  });

  // if (!userProfile) {redirect('/');}
  if (!userProfile) {
    redirect('/auth/login');
  }

  // 2025jul29: no idea why below line is needed, this seems entirely redundant with code above; leaving in for now, what harm? 
  if (!userProfile.authUser) {redirect('/');} // added 2025jul09 to avert newfound Ts issue with nullable userProfile.authUser
  
  // 4 - if this authUser has a value in duplicateOfId, i.e., this is a dupe authUser, so redirect. 
  // this prevents all system interaction for duplicate authUsers
  if (dbAuthUser.duplicateOfId) {
    redirect('/');
  }

  // FINAL: 
  // failure to redirect based on scenarios above mean all goo, so return full userProfile object (for consumption/used by parent file)
  return userProfile as FullUserProfile; // 2025jul09: replaces above to avert newfound Ts issue with nullable userProfile.authUser

}

export async function getAuthenticatedUserProfileOrNull() {
  const authSession = await auth0.getSession();
  const authSessionUser = authSession?.user;

  if (!authSession || !authSessionUser || !authSessionUser.sub) { // note: I don't think it's possible in auth0 to get session but no .sub, but double check is fine
    return null;
  }

  const dbAuthUser = await prisma.authUser.findUnique({
    where: { auth0Id: authSessionUser.sub },
  });

  if (!dbAuthUser) {
    return null; 
  }

  // 3 - ensure user_profile record exists for user; else, redirect. 
  const dbUserProfile = await prisma.userProfile.findUnique({
    where: { userId: dbAuthUser.id },
    include: {
      authUser: true,
    },
  });

  return dbUserProfile as FullUserProfile;
}

/**
 * Placeholder: Extend this to verify the authenticated user is an organizer.
 * If not an organizer, redirect to login or access-denied page.
 */
export async function getAuthOrganizerOrRedirect() { // we are gonnna rename this: verifyAuthenticatedUserOrganizer (or something like that)
  throw new Error('getAuthOrganizerOrRedirect not yet implemented');
}

/**
 * Placeholder: Extend this to verify the authenticated user is an admin.
 * If not an admin, redirect to login or access-denied page.
 */
export async function getAuthAdminOrRedirect() { // we are gonnna rename this: verifyAuthenticatedUseAdmin (or something like that)
  throw new Error('getAuthAdminOrRedirect not yet implemented');
}

