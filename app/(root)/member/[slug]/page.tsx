// app/member/[slug]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card'; // required prerequisite: npx shadcn@latest add card   
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // required prerequisite: npx shadcn@latest add avatar   
import { Badge } from '@/components/ui/badge'; // required prerequisite: npx shadcn@latest add badge   
import { Button } from '@/components/ui/button'; // required prerequisite: npx shadcn@latest add button   
import { UserAvatar } from '@/components/shared/user-avatar'; // required prerequisite: npx shadcn@latest add UserAvatar   

// type PageProps = {
//   params: {
//     slug: string;
//   };
// };

// app/(root)/member/[slug]/page.tsx

export default async function MemberPage({ params }: { params: { slug: string } }) {
// 2025apr04: above replaced by below to resolve deployment issue 
// export default async function MemberPage({ params }: PageProps) {
  const profile = await prisma.userProfile.findFirst({
    where: {
      OR: [
        { slugVanity: params.slug },
        { slugDefault: params.slug },
      ],
    },
    include: {
      authUser: true,
    },
  });

  if (!profile) notFound();

  const {
    authUser,
    altEmail,
    altNickname,
    phone,
    slugDefault,
    slugVanity,
  } = profile;

  const displayName = authUser.name || altNickname || `${authUser.givenName ?? ''} ${authUser.familyName ?? ''}`.trim() || 'Unnamed User';
  const displaySlug = slugVanity || slugDefault;

  return (
    <section className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Profile Pic */}
        <div className="col-span-2 flex flex-col items-center gap-4">

          <UserAvatar
            src={authUser.picture}
            fallback="A"
            // size="lg"
            size="xl"
            className=' ring-2 ring-gray-400 shadow-lg'
            altProp={displayName}
          />

          <div className="text-center">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground text-sm font-mono">{displaySlug}</p>
            {altNickname && <p className="italic text-muted-foreground text-sm">“Also known as {altNickname}”</p>}
          </div>
        </div>

        {/* Contact Info */}
        <div className="col-span-2 space-y-4 p-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{authUser.email}</p> 
          </div>
          {altEmail && (
            <div>
              <p className="text-sm text-muted-foreground">Alt Email</p>
              <p className="font-medium">{altEmail}</p>
            </div>
          )}
          {phone && (
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{phone}</p>
            </div>
          )}
        </div>

        {/* Sidebar Card */}
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Profile Type</span>
                <Badge variant="secondary">Member</Badge>
              </div>
              <Button className="w-full">Connect</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
