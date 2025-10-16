// app/(root)/about/page.tsx

import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DuplicateUser() {

    // devNotes: 
    // below user check is very similar to getAuthenticatedUserProfileOrNull, but with key differences. 
    // getAuthenticatedUserProfileOrNull() can't be used here (as it is on every other page), b/c that function redirects users to this page,  
    // and if we use that redirection to a page we're already on, we get a proven redirecting loop.
    // Thus, getAuthenticatedUserProfileOrNull is repeated below, but with major difference: directs AWAY from this page IF the user is NOT a duplicate user.

    // 0 - Validate user, part 1: is an authenticated dupe user?  

    const authSession = await auth0.getSession();
    const authSessionUser = authSession?.user;
  
    // 1 - ensure foundational attributes exist; absence of this = not authenticated.
    if (!authSession || !authSessionUser || !authSessionUser.sub) { // note: I don't think it's possible in auth0 to get session but no .sub, but double check is fine
      redirect('/');
    }
  
    // 2 - get the authUser record; absence of this = not authenticated.
    const dbAuthUser = await prisma.authUser.findUnique({
      where: { auth0Id: authSessionUser.sub },
    });
  
    if (!dbAuthUser) {
      redirect('/');
    }

    // devNotes: next step not relevant for this page; we aren't using/displaying/calling userProfile object/attributes.
    // // 3 - get the userProfile record related to that dbAuthUser record (and include the original authUser record as child object)
    // const dbUserProfile = await prisma.userProfile.findUnique({
    //   where: { userId: dbAuthUser.id },
    //   include: {
    //     authUser: true,
    //   },
    // });
  
    // 4 - if NOT a duplicate user, redirect from this page.  This page is only for communicating with duplicate users. 
    if (!dbAuthUser.duplicateOfId) {
      redirect('/');
    }

    return ( 
        <main>
        </main>
      );
} 