// lib/enhancedAuthentication/authUserVerification.ts

import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserProfile, AuthUser } from '@prisma/client';

//  prereq: Declare custom type for the joined profile with authUser relation included
type FullUserProfile = UserProfile & {
    authUser: AuthUser;
  };

// 2025oct15: this is the new standard authentication function for all pages/routes. 
export async function getAuthenticatedUserProfileOrNull() {
  const authSession = await auth0.getSession();
  const authSessionUser = authSession?.user;

  // 1 - ensure foundational attributes exist
  if (!authSession || !authSessionUser || !authSessionUser.sub) { // note: I don't think it's possible in auth0 to get session but no .sub, but double check is fine
    return null;
  }

  // 2 - get the authUser record
  const dbAuthUser = await prisma.authUser.findUnique({
    where: { auth0Id: authSessionUser.sub },
  });

  if (!dbAuthUser) {
    return null; 
  }
  // 3 - get the userProfile record related to that dbAuthUser record (and include the original authUser record as child object)
  const dbUserProfile = await prisma.userProfile.findUnique({
    where: { userId: dbAuthUser.id },
    include: {
      authUser: true,
    },
  });

  // 4 - if this authUser has a value in duplicateOfId, i.e., this is a dupe authUser, so redirect. This prevents all system interaction for duplicate authUsers
  if (dbAuthUser.duplicateOfId) {
    redirect('/duplicate-user');
  }

  return dbUserProfile as FullUserProfile;
}


// 2025oct15: 
// I think this entire getAuthenticatedUser funct should be deprecated then deleted, b/c redirect for login should not be here; the redirecting code must exist on the originating page itself, so that 
// that such page's url/string can be submitted as part of the login redirect, thus ensuring that the user is redircted to such page after successful login (instead of being redirected to a static homepage)

// This first function should be renamed getAuthenticatedUserOrRedirect, 
// and it's used to strictly prohibit unauthenticated users from accessing specific pages, such as user profiles pages.

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

export async function getAuthenticatedUser(): Promise<FullUserProfile> { // we are gonnna rename this: getAuthenticatedUserProfileOrRedirect
  
// 1 - if not authenticated, redirect to login

  // 2025oct11: above replaced by below; RETRY LOGIC: Try to get session up to 3 times.  doing this b/c in production, randomly not getting session/user and being redirected back to homepage.
  // 2025oct15: that error above was isolated to problems in the auth0.ts file.  This "3 tries" stuff is garbage. Leaving it alone, not worth resetting code to former state. 
  let authSession = null;
  let authSessionUser = null;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts && !authSessionUser) {
    attempts++;
    
    authSession = await auth0.getSession();
    authSessionUser = authSession?.user;
    
    if (!authSessionUser && attempts < maxAttempts) { 
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait 50ms before retrying
    }
  }

  if (!authSessionUser) {
    console.log(' No auth session user - redirecting to /auth/login');
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
    console.log(' No userProfile - redirecting to /auth/login');
    redirect('/auth/login');
  }

  // 2025jul29: no idea why below line is needed, this seems entirely redundant with code above; leaving in for now, what harm? 
  if (!userProfile.authUser) {
    redirect('/');
  } // added 2025jul09 to avert newfound Ts issue with nullable userProfile.authUser
  
  // 4 - if this authUser has a value in duplicateOfId, i.e., this is a dupe authUser, so redirect. 
  // this prevents all system interaction for duplicate authUsers
  if (dbAuthUser.duplicateOfId) {
    redirect('/');
  }

  // FINAL: 
  // failure to redirect based on scenarios above mean all good, so return full userProfile object (for consumption/use by parent file)
  return userProfile as FullUserProfile; 
}

// 2025oct15: no idea if/when/how we'll ever use below.  These functs not called by anything, total placeholder, no specific vision ever to even use them. 
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

