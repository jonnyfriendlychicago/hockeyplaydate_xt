// app/(root)/[slug]/page.tsx // aa version!

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns'; // npm install date-fns
// import { maskName } from '@/lib/helpers/maskName'; // new helper function you should create
// import { myMembershipTab } from '@/components/chapter/myMembershipTab';

export const dynamic = 'force-dynamic';

export default async function ChapterPage({ params }: { params: { slug: string } }) {
  
  // 0 - authenticate user
  const  authenticatedUser = await getAuthenticatedUserProfileOrNull(); 
  
  // 1 - load chapter / redirect
  const slug = params.slug;
  const chapter = await prisma.chapter.findUnique({
    where: { slug },
  });

  if (!chapter) notFound();
  
  // 3 - Determine user profile
  let anonVisitor = false;
  let authVisitor = false;
  let genMember = false;
  let mgrMember = false;
  let blockedMember = false;

  if (!authenticatedUser) {
    anonVisitor = true;
  } else {
    const membership = await prisma.chapterMember.findFirst({
      where: {
        userProfileId: authenticatedUser.id,
        chapterId: chapter.id,
      },
    });

    if (!membership) {
      authVisitor = true;
    } else if (membership.memberRole === 'BLOCKED') {
      blockedMember = true;
    } else if (membership.memberRole === 'MANAGER') {
      mgrMember = true;
    } else {
      genMember = true;
    }
  }


  // 4. Display logic for obfuscated organizer names if unauthenticated
  // const organizerNames = chapter.members.map((m) => {
  //   const name = `${m.userProfile?.givenName ?? ''} ${m.userProfile?.familyName ?? ''}`.trim();
  //   return authUser ? name : maskName(name);
  // });

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Right Edit Button (placeholder for now) */}
      {
      mgrMember && (
        <div className="flex justify-end">
          <button className="text-sm text-muted-foreground">[Edit Placeholder]mgrMember</button>
        </div>
      )
      }

      {/* Chapter Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {chapter.name}
        </h1>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Placeholder for Feature */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-semibold">[Coming Soon]</p>
              <p className="text-sm">Photos and logo for this chapter will go here</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: About the Chapter */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p><span className="font-semibold">Created:</span> {format(chapter.createdAt, 'MMMM d, yyyy')}</p>
              {chapter.description && (
                <p><span className="font-semibold">About:</span> {chapter.description}</p>
              )}
              {/* <p>
                <span className="font-semibold">Organizers:</span>{' '}
                {organizerNames.length > 0 ? organizerNames.join(', ') : 'None listed'}
              </p> */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <p className="text-muted-foreground italic">[Events Placeholder]</p>
        </TabsContent>
        <TabsContent value="members">
          <p className="text-muted-foreground italic">[Members Placeholder]</p>
        </TabsContent>
        <TabsContent value="locations">
          <p className="text-muted-foreground italic">[Locations Placeholder]</p>
        </TabsContent>
        
        {/* <TabsContent>
          <myMembershipTab
            joinDate={format(chapterMembership.createdAt, 'MMMM d, yyyy')}
            memberRole={chapterMembership.memberRole}
            isActive={chapterMembership.status === 'ACTIVE'}
          />

        </TabsContent> */}


      </Tabs>
    </section>
  );
}
