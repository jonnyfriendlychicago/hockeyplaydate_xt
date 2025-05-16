// app/(root)/member/edit/page.tsx

// import { auth0 } from '@/lib/auth0';
// import { prisma } from '@/lib/prisma';
import EditUserProfileForm from '@/components/UserProfile/EditUserProfileForm';
// import { redirect } from 'next/navigation';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
import { getAuthUserOrRedirect } from '@/lib/enhancedAuthentication/authUserVerification';

export default async function EditProfilePage() {
  // (0) authentication / security
  // const session = await auth0.getSession();
  // const sessionUser = session?.user;
  // if (!sessionUser) redirect('/auth/login');
  // const dbUser = await prisma.authUser.findUnique({
  //   where: { auth0Id: sessionUser.sub },
  // });
  // if (!dbUser) redirect('/auth/login');
  // 2025may16: above repeating code block replaced by utlity below
  const  userProfile = await getAuthUserOrRedirect();

  // (1) essential variables
  // const userProfile = await prisma.userProfile.findUnique({ // get as-is user profile (for downstream use in form)
  //   where: { userId: dbUser.id },
  //   // adding below to get sibling authuser object
  //   include: { // this include here means: get sibling authUser object? yes! 2025may08
  //     authUser: true, 
  //   },
  // });
  // // (1.1) abandon if path failure encountered
  // if (!userProfile) redirect('/'); // this scenario should never be reached, b/c every authUser record will have an associated userProfile record, unless Auth0 or core HPD usermgmt code went berzerk at login

  const displayName = // create a display name variable, which shall be the altProp in the  profile photo displayed on the page (which is not edittable on this form, fyi)
  `${userProfile.givenName ?? ''} ${userProfile.familyName ?? ''}`.trim() || userProfile.authUser.email 
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

        {/* Row 1: cancel button area */}
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

      {/* Row 2: Avatar + Family photo  (non-editable) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Avatar */}
        <div className="col-span-2 flex flex-col items-center justify-center gap-4">
          <UserAvatar
            // src={dbUser.picture}
            src={userProfile.authUser.picture}
            fallback="A"
            size="xl"
            className="ring-2 ring-gray-400 shadow-lg"
            altProp={displayName}
          />
        </div>

        {/* Right: Family photo and blurb (placeholder) */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-semibold">[Coming Soon]</p>
              <p className="text-sm">Add your family photo and short blurb here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Editable Form */}
      <div className="w-full">
        <EditUserProfileForm 
        initialValues={normalizedProfile} 
        defaultSluggy={userProfile.slugDefault} 
        authUserEmail= {authUserEmail}
        />
      </div>
    </section>
  );
}