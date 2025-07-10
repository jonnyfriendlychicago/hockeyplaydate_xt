// app/(root)/member/[slug]/page.tsx

// 2025may16: note for future self: 
// (1) we should enhance this to use a function from lib/enhancedAuthentication/authUserVerification.ts and 
// (2) this entire file needs to be updated: only display those users who are fellow members of authenticated users groups

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
import { auth0 } from '@/lib/auth0';
import { EmailBlock } from '@/components/UserProfile/EmailBlock';
import { CopyText } from '@/components/shared/copyText';

export default async function MemberPage({ params }: { params: { slug: string } }) {
  // (0) authentication / security
  const session = await auth0.getSession();
  const sessionUser = session?.user;
  // PLACEHOLDER FOR REDIRECTING NOT-AUTHENTICATED / NOT-ALLOWED USERS

  // (1) essential variables
  const profile = await prisma.userProfile.findFirst({
    where: {
      OR: [
        { slugVanity: params.slug },
        { slugDefault: params.slug },
      ],
    },
    include: { // this include here means: get sibling authUser object? yes!
      authUser: true, 
    },
  });
  // (1.1) abandon if path failure encountered
  if (!profile) notFound(); // this is essential, b/c profile record comes from slug, which comes from URL param, which could be junk, ergo: display notfound page
  if (!profile?.authUser) notFound(); // no such thing as a valid profile without a linked authUser.  This line resolves typescript errors. 


  const { authUser, altEmail, phone } = profile; // Extract common fields from profile for easier reference below
  // 101 on above: this is object destructuring to cleanly extract values from the profile object. It’s equivalent to this:
  // const authUser = profile.authUser;
  // const altEmail = profile.altEmail;
  // const phone = profile.phone;

  const displayName =
    `${profile.givenName ?? ''} ${profile.familyName ?? ''}`.trim() || authUser.email ||'Nameless User'; // this value should never be reached, b/c every authUser record will have email, unless Auth0 or core HPD usermgmt code went berzerk at login

  const isSessionUserProfile = sessionUser?.sub === authUser.auth0Id;

  const formatPhoneNumber = (raw: string) =>
    raw.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3');

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Edit Icon Top-Right */}
      {isSessionUserProfile && (
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
      {profile.altNickname && (
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            {profile.altNickname}
          </h1>
        </div>
      )}

      {!profile.altNickname && isSessionUserProfile && (
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
            src={authUser.picture}
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
                  altEmail={altEmail}
                  loginEmail={authUser.email}
                  isOwner={isSessionUserProfile}
                />

                {phone && (
                  <div id="phone">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{formatPhoneNumber(phone)}</p>
                      <CopyText text={phone} />
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
