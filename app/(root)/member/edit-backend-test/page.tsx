// app/(root)/member/edit-backend-test/page.tsx
// this entire file purely for testing backend api; it is not intended for production use by end users
// 2025may13: after more than 10 tries, we cannot seem to get the conditional redirect to work in a deployed environment.  No idea why, works fine in local dev under all scenarios; deployment failure doesn't make any sense.  
// cont'd: we moved that env-based redirect line up/down this file multiple places, but it doesn't work reliably regardless. Abandoning env-based rendering with redirect. 
// 2025may14: env-based conditional rendering with notFound() seems to work very solid, and in retrospect, this shoulda been the chosen path from get-go.  
// below is a skeleton proof of this, which is being kept commOUT for future reference. 

// begin skeleton file
// export const dynamic = 'force-dynamic';
// import { notFound } from 'next/navigation';

// export default function EditProfilePage() {
// //  redirect('/'); // this replaces everything else. 
// if (process.env.ALLOW_BACKEND_TEST_FORM !== 'true') notFound();

// return (
//   <div>
//     <h1>hello hello</h1>
//   </div>
// )
// } 
// end skeleton file

export const dynamic = 'force-dynamic';
// 101 on above: this page references the .env file, and the page will either display or redirect based on that value.  
// Next.js prerenders pages by default in the App Router (especially page.tsx files). If you want dynamic behavior — such as checking environment variables at request time — you must explicitly opt out of that behavior.
// Without export const dynamic = 'force-dynamic', all the other steps will silently fail to achieve your intended effect. The redirect logic will look correct in code, but won’t execute at runtime as you expect.

import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import EditUserProfileBackendTestForm from '@/components/UserProfile/EditUserProfileBackendTestForm';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';

// this entire file (aside from the 'notFound' first line) is a dupe to file app/(root)/member/edit-backend-test/page.tsx.  This is by design, so that differences between prod-suited edit form and
// this test-oriented form are limited to EditUserProfileBackendTestForm.tsx (and its imported files)
  export default async function EditProfilePage() {
  if (process.env.ALLOW_BACKEND_TEST_FORM !== 'true') notFound();
  // (0) authentication / security
  const session = await auth0.getSession();
  const sessionUser = session?.user;
  if (!sessionUser) return redirect('/auth/login');
  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });
  if (!dbUser) return redirect('/auth/login');
  
  // (1) essential variables
  const userProfile = await prisma.userProfile.findUnique({ // get as-is user profile (for downstream use in form)
    where: { userId: dbUser.id },
    // adding below to get sibling authuser object
    include: { // this include here means: get sibling authUser object? yes! 2025may08
      authUser: true, 
    },
  });
  
  // (1.1) abandon if path failure encountered
  if (!userProfile) return redirect('/'); // this scenario should never be reached, b/c every authUser record will have an associated userProfile record, unless Auth0 or core HPD usermgmt code went berzerk at login
  
  const displayName = // create a display name variable, which shall be the altProp in the  profile photo displayed on the page (which is not edittable on this form, fyi)
  `${userProfile.givenName ?? ''} ${userProfile.familyName ?? ''}`.trim() || dbUser.email 
  || 'Nameless User'; // this value should never be reached, b/c every authUser record will have email, unless Auth0 or core HPD usermgmt code went berzerk at login
  
  const cancelButtonSluggy= userProfile.slugVanity || userProfile.slugDefault // this sluggy variable is used in the "cancel" button of this form page, to correctly return to the correct user profile page
  
  const authUserEmail = userProfile.authUser.email; // super simple var we need to pass into the form for a form description value
  
  
  // (2) Normalize nullable fields for prop shape compliance, i.e. empty strings v. nulls. 
  
  // Explanation:
  // Prisma.UserProfile.familyName and Prisma.UserProfile.givenName are typed as string | null (nullable), b/c db needs to allow null values on initial record creation, e.g., no values provided by Auth0
  // But our validation schema that this form hits requires a value (rightly so), so is not nullable: userProfileValSchema.familyName is typed as string (non-nullable, required via .min(1)). Same for givenName.
  // This would cause a typescript mismatch, and break the app.  
  // We resolve this by creating this "normalized" version of the object, which ensures givenName and familyName are guaranteed string going into the form flow.
  const normalizedProfile = {
    ...userProfile, // this is a spread operator: takes all the key:value paries from the object, exposes them for use
    // givenName kvp, familyName kvp, etc. comes out of above, but then we override it with the following lines:
    givenName: userProfile.givenName ?? '', // 101: '??' is a nullish coalescing operator: It means: If userProfile.givenName is null or undefined, use '' (empty string) instead.
    familyName: userProfile.familyName ?? '',
    
    // below is legacy code, to be deleted when feel like it.  2025may07
    // altNickname: userProfile.altNickname ?? '',
    // altEmail: userProfile.altEmail ?? '',
    // phone: userProfile.phone ?? '',
    // slugVanity: userProfile.slugVanity ?? ''
  };
  

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">


        <div className="flex justify-end">
          <Link href={`/member/${cancelButtonSluggy}`}>
            <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 hover:bg-red-50 ">
              <CircleX className="w-4 h-4 text-destructive" />
              <span className="text-destructive">Cancel</span>
            </Button>
          </Link>
        </div>


      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        <div className="col-span-2 flex flex-col items-center justify-center gap-4 ">
          <UserAvatar
            src={dbUser.picture}
            fallback="A"
            size="xl"
            className="ring-2 ring-gray-400 shadow-lg "
            altProp={displayName}
          />
        </div>


        <div className="col-span-3">
          <Card className="h-full bg-black border">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <h1 className='bg-slate-600'>THIS ENTIRE PAGE/FORM IS FOR TESTING BACKEND ONLY</h1>
            </CardContent>
          </Card>
        </div>
      </div>


      <div className="w-full">
        <EditUserProfileBackendTestForm
        initialValues={normalizedProfile} 
        defaultSluggy={userProfile.slugDefault} 
        authUserEmail= {authUserEmail}
        />
      </div>
    </section>
  );
}

