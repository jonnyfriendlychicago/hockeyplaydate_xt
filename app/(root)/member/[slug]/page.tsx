// app/(root)/member/[slug]/page.tsx

export const dynamic = 'force-dynamic';
// 101: This server-side page, by default, doesn't refresh data when its been visited just recently.  
// Result is that upon routing here from edit form, the page will display with cached (and now stale) data.
// Above disables caching and should force the server to re-fetch fresh data on each navigation to this page.  
// BUT, that's not happening actually b/c force-dynamic only applies to server-side rendering, not to client-side router state. 
// Keep this here, however, because it works on first navigation or reload.
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Pencil } from 'lucide-react';
import { EmailBlock } from '@/components/UserProfile/EmailBlock';
import { CopyText } from '@/components/shared/copyText';
// import { getAuthenticatedUser } from '@/lib/enhancedAuthentication/authUserVerification';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { redirect } from 'next/navigation';

export default async function MemberPage({ params }: { params: { slug: string } }) {
  
  // 0 - authenticate user
  // const  authenticatedUser = await getAuthenticatedUser(); 
  // 2025oct12: above replaced by below
  const  authenticatedUser = await getAuthenticatedUserProfileOrNull(); 

   if (!authenticatedUser) {
      // return (
      //   <section className="max-w-6xl mx-auto p-6 text-center py-12">
      //     <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
      //     <p className="text-muted-foreground mb-4">
      //       Ok, this is embarrassing. Our app encountered a random error on this page. 
      //     </p>
      //     <p className="text-sm text-muted-foreground">
      //       Kindly refresh your browswer?  If this problem continues, please contact TECH SUPPORT PLACEHODLER EMAIL.
      //     </p>
      //   </section>
      // );
      // If not authenticated, redirect to login
      console.log("no authenticated user - redirect to login")
      // redirect('/auth/login');
      const returnTo = `/member/${params.slug}`;
      redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  
    if (authenticatedUser?.authUser.duplicateOfId) {
      console.log("dupe authenticated user - redirect home")
         redirect('/');
         // devNotes: please do not type above line as `return redirect('/');`  Such will work in development but not ubuntu server in production.
      }

  // note: duplicateUser will be redirected to homepage based on above.

  // 1- validate target user profile
  const presentedUserProfile = await prisma.userProfile.findFirst({
    where: {
      OR: [
        { slugVanity: params.slug },
        { slugDefault: params.slug },
      ],
    },
    include: { // devNote: this include here means: get sibling authUser object? yes!
      authUser: true, 
    },
  });

  // redirect if target user not found in db via look-up above.  
  // devNote: by having this check at this point in file, TS is satisfied that presentedUserProfile exists, so the downstream references of 'presentedUserProfile' don't need to resolve possible null situation.  
  if (!presentedUserProfile) notFound(); // this is essential, b/c profile record comes from slug, which comes from URL param, which could be junk, ergo: display notfound page
  if (!presentedUserProfile?.authUser) notFound(); // no such thing as a valid profile without a linked authUser, but this line resolves TS errors. 

  // 2 - validate permission to view target profile: shared chapter(s) with authenticated user?
  if (authenticatedUser.authUser.auth0Id !== presentedUserProfile.authUser.auth0Id) { // Not viewing own profile, so check shared chapters

    // 2.1 - get chapters where auth user is MEMBER or MANAGER
    const authUserChapters = await prisma.chapterMember.findMany({
      where: {
        userProfileId: authenticatedUser.id,
        memberRole: { in: ['MEMBER', 'MANAGER'] }
      },
      select: { chapterId: true }
    });
    
    // 2.2 - create array of IDs of those chapters
    const authUserChapterIds = authUserChapters.map(cm => cm.chapterId);

    // // 2.3 - check if presented user is in any of those chapters as MEMBER or MANAGER
    // const sharedChapter = await prisma.chapterMember.findFirst({ // doing 'findFirst' b/c as soon as even one is found, then BOOM, they are chapter siblings.
    //   where: {
    //     userProfileId: presentedUserProfile.id,
    //     chapterId: { in: authUserChapterIds },
    //     memberRole: { in: ['MEMBER', 'MANAGER'] }
    //   }
    // });

    // // No shared chapters - deny access
    // if (!sharedChapter) {
    //   // return notFound();
    //   return (
    //     <section className="max-w-6xl mx-auto p-6 text-center py-12">
    //       <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
    //       <p className="text-muted-foreground mb-4">
    //         Sorry, you do not have permission to view this profile.
    //       </p>
    //       <p className="text-sm text-muted-foreground">
    //         You can only view profiles of members in your chapters.
    //       </p>
    //     </section>
    //   );

    // above replaced by below; above wrongly prevented managers from seeing applicants/removeds/blocks

    // 2.3 - check if presented user shares any chapters with auth user
    // Two scenarios allow viewing:
    // (a) Both users are active members (MEMBER or MANAGER) in same chapter
    // (b) Auth user is MANAGER and presented user has ANY status in that chapter

    const sharedChapter = await prisma.chapterMember.findFirst({
      where: {
        userProfileId: presentedUserProfile.id,
        chapterId: { in: authUserChapterIds },
        // Presented user can have any role - we'll check auth user's role below
      }
    });

    // If no shared chapter at all, deny access
    if (!sharedChapter) {
      return (
        <section className="max-w-6xl mx-auto p-6 text-center py-12">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            Sorry, you do not have permission to view this profile.
          </p>
          <p className="text-sm text-muted-foreground">
            You can only view profiles of members in your chapters.
          </p>
        </section>
      );
    }

    // Now verify auth user's permission level for this shared chapter
    const authUserChapterRole = await prisma.chapterMember.findFirst({
      where: {
        userProfileId: authenticatedUser.id,
        chapterId: sharedChapter.chapterId
      },
      select: { memberRole: true }
    });

    // Auth user must be either:
    // - MANAGER (can see anyone in their chapter), OR
    // - Active member (MEMBER/MANAGER) viewing another active member
    const isManager = authUserChapterRole?.memberRole === 'MANAGER';
    const bothActiveMembers = 
      ['MEMBER', 'MANAGER'].includes(authUserChapterRole?.memberRole || '') &&
      ['MEMBER', 'MANAGER'].includes(sharedChapter.memberRole);

    if (!isManager && !bothActiveMembers) {
      return (
        <section className="max-w-6xl mx-auto p-6 text-center py-12">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            Sorry, you do not have permission to view this profile.
          </p>
          <p className="text-sm text-muted-foreground">
            You can only view profiles of active members in your chapters.
          </p>
        </section>
      );
    }

    }
  

  // 3 - essential display variables

  // quick note: we previously used this method: 

  // const { authUser, altEmail, phone } = presentedUserProfile
  // ... to extract common fields from presentedUserProfile for easier reference downstream in file. 
  // BUT! This variable naming convention caused lots of confusion between the authenticatedUser profile and presentedUserProfile.  So, abandoned.  
  // 101 on above: this is object destructuring to cleanly extract values from the profile object. It’s equivalent to this:
  // const authUser = presentedUserProfile.authUser;
  // const altEmail = presentedUserProfile.altEmail;
  // const phone = presentedUserProfile.phone;

  const displayName = `${presentedUserProfile.givenName ?? ''} ${presentedUserProfile.familyName ?? ''}`.trim() || presentedUserProfile.authUser.email 
  ||'Nameless User'; // this value should never be reached, b/c every authUser record will have email, unless Auth0 or core HPD usermgmt code went berzerk at login

  const isAuthenticatedUsersProfile = authenticatedUser.authUser.auth0Id === presentedUserProfile.authUser.auth0Id; 

  const formatPhoneNumber = (raw: string) =>
    raw.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3');

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Edit Icon Top-Right */}
      {isAuthenticatedUsersProfile && (
        <div className="flex justify-end">
          <Link href="/member/edit">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        </div>
      )}

      {/* Family Display Name (altNickname as brand/hero) */}
      {presentedUserProfile.altNickname && (
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            {presentedUserProfile.altNickname}
          </h1>
        </div>
      )}

      {!presentedUserProfile.altNickname && isAuthenticatedUsersProfile && (
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            [PLACEHOLDER FOR YOUR FAMILY BRAND!]
          </h1>
          <p className="text-sm text-muted-foreground">Only you are seeing above placeholder.  Click &lsquo;Edit&lsquo;, then enter/save your Family Brand Name, then that will appear to users in the space above. </p>
        </div>
      )}

      {/* Top Row: Avatar + Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Name + Avatar */}
        <div className="col-span-2 flex flex-col items-center justify-center gap-4">
          <UserAvatar
            src={presentedUserProfile.authUser.picture}
            fallback="A"
            size="xl"
            className="ring-2 ring-gray-400 shadow-lg"
            altProp={displayName}
          />
          <h2 className="text-2xl font-bold text-center">{displayName}</h2>
        </div>

        {/* Right: Placeholder Card for Future Feature */}
        <div className="col-span-3">
          <Card className="h-full">
           
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-semibold">[Coming Soon]</p>
              <p className="text-sm">Add your family photo and short blurb here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Full-width Contact Info Card */}
      <div className="w-full">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            
            <div className="flex flex-col md:flex-row md:items-start md:gap-12 gap-6">
              {/* Left Column: Email + Phone */}
              <div className="md:max-w-md w-full space-y-4">
                {/* note: EmailBlock could be smaller, put all that show/not logic on this page, and then only pass altEmail and loginEmail to the component; but leaving well-enough alone for now. 2025may08 */}
                <EmailBlock
                  altEmail={presentedUserProfile.altEmail}
                  loginEmail={presentedUserProfile.authUser.email}
                  isOwner={isAuthenticatedUsersProfile}
                />

                {presentedUserProfile.phone && (
                  <div id="phone">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{formatPhoneNumber(presentedUserProfile.phone)}</p>
                      <CopyText text={presentedUserProfile.phone} />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Social Links (placeholder) */}
              <div className="w-full md:flex-1">
                <p className="text-sm text-muted-foreground mb-1">Social</p>
                <p className="text-muted-foreground italic">[Coming Soon: links to your social media]</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </section>
  );
}
