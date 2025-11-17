// app/(root)/member/edit-backend-test/page.tsx

// 2025may16: note for future self: we should enhance this to use a function from lib/enhancedAuthentication/authUserVerification.ts 

// this entire file purely for testing backend api; it is not intended for production use by real-life end users
// 2025may13: after more than 10 tries, we cannot seem to get the conditional redirect to work in a deployed environment.  No idea why, works fine in local dev under all scenarios; failure in deployed env doesn't make any sense.  
// cont'd: we moved that env-based redirect line up/down this file multiple places, but it doesn't work reliably regardless. Abandoning env-based rendering with redirect. 
// 2025may14: env-based conditional rendering with notFound() works very solid, and in retrospect, this should have been the chosen path from get-go.  
// below is a skeleton proof of this, which is being kept here in commOUT for future reference. 

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

// NOTE: this entire file (aside from the 'notFound' first line) is a dupe to file app/(root)/member/edit-backend-test/page.tsx.  This is by design, so that differences between prod-suited edit form and
// this test-oriented form are limited to EditUserProfileBackendTestForm.tsx (and its imported files)

export const dynamic = 'force-dynamic';

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

// devNotes: the key word 'default' below is required for Next.js page components, i.e. page.tsx
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
  const userProfile = await prisma.userProfile.findUnique({ 
    where: { userId: dbUser.id },
    include: { 
      authUser: true, 
    },
  });
  
  // (1.1) abandon if path failure encountered
  if (!userProfile) return redirect('/'); 
  if (!userProfile?.authUser) return redirect('/'); // no such thing as a valid profile without a linked authUser.  This line resolves typescript errors. 
  
  const displayName = 
  `${userProfile.givenName ?? ''} ${userProfile.familyName ?? ''}`.trim() || dbUser.email 
  || 'Nameless User'; 
  
  const cancelButtonSluggy= userProfile.slugVanity || userProfile.slugDefault 
  
  const authUserEmail = userProfile.authUser.email; 
  
  // (2) Normalize nullable fields for prop shape compliance, i.e. empty strings v. nulls. 
  const normalizedProfile = {
    ...userProfile, // this copies ALL fields from userProfile
    givenName: userProfile.givenName ?? '', // this overrides specific fields
    familyName: userProfile.familyName ?? '',
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

