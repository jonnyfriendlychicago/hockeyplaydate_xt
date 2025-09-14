// app/(root)/[slug]/page.tsx 

// IMPORTANT FYI: THIS IS THE "CHAPTER" PAGE.  Business/design decision made to place the chapter page (i.e. chapter slug) at the highest root level, 
// so that chapters look like this: hockeyplaydate.com/chicago-central ... rather than hockeyplaydate.com/chapters/chicago-central
// This enhances chapter branding, eases sharing/communications among members, and improved accessibility for potential members. 

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { format } from 'date-fns'; // npm install date-fns
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { JoinChapterButton } from '@/components/chapter/JoinChapterButton';
import { BlockedNotice } from '@/components/chapter/BlockedNotice';
import { getUserDisplayName } from "@/lib/helpers/getUserDisplayName";
import { CreateEventButton } from "@/components/chapter/CreateEventButton";
import { redirect } from 'next/navigation';
import { EventsTabContent } from '@/components/chapter/EventsTabContent';
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus';

// import { maskName } from '@/lib/helpers/maskName'; // new helper function you should create
// import { myMembershipTab } from '@/components/chapter/myMembershipTab';

export const dynamic = 'force-dynamic';

export default async function ChapterPage({ params }: { params: { slug: string } }) {
  
  // 0 - Validate user, part 1: authenticated not-dupe user? 
  const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 
  // bounce if dupe user 
  if (authenticatedUserProfile?.authUser.duplicateOfId) {
     redirect('/');
     // devNotes: please do not type above line as `return redirect('/');`  That will work in development but not ubuntu server in production.
  }
  
  // 1 - load chapter / redirect
  const slug = params.slug;
  const chapter = await prisma.chapter.findUnique({
    where: { slug },
  });

  if (!chapter) notFound();

  // NEW: Load events with RSVPs for this chapter
  const events = await prisma.event.findMany({
    where: { chapterId: chapter.id },
    include: {
      rsvps: {
        select: {
          id: true,
          rsvpStatus: true,
          userProfileId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }, // Default order, component will re-sort
  });
  
  // 2 - Validate user, part 2: requisite chapterMember permissions? 
  // devNote: 2025sep14: this var 'userStatus' is badly named; should be something like userChapterMemberStatus / similar.  
  // Additioonally, we could consider doing this: instead of being an object, have it be a simple text variable: user = anonVisitor, or something like that.
  // leaving both of these code design points on the backburner for now. 
  const userStatus = await getUserChapterStatus(
    chapter.id, 
    authenticatedUserProfile
  );

  console.log(userStatus)

  // 4. Display logic for obfuscated organizer names if unauthenticated
  // const organizerNames = chapter.members.map((m) => {
  //   const name = `${m.userProfile?.givenName ?? ''} ${m.userProfile?.familyName ?? ''}`.trim();
  //   return authUser ? name : maskName(name);
  // });

  // 5 - other variables
  const authenticatedUserProfileNameString = getUserDisplayName(authenticatedUserProfile);

  const isApprovedMember = userStatus.genMember || userStatus.mgrMember;

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* ===================== */}
      {/* ZONE 1: Header & Edit */}
      {/* ===================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-primary text-center md:text-left">
          {chapter.name} Chapter
        </h1>

        {/* Top Right Edit Button (href update needed!) */}
        {userStatus.mgrMember && (
          <Link href={`/${slug}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <Pencil className="w-4 h-4" />
              Edit Chapter Info
            </Button>
          </Link>
        )}
      </div>

      {/* ===================== */}
      {/* ZONE 1.5: Blocked Notice */}
      {/* ===================== */}
      {userStatus.blockedMember && 
       <BlockedNotice nameString={authenticatedUserProfileNameString} />
      }

      {/* =========================== */}
      {/* ZONE 2: 2-Column Main Layout */}
      {/* =========================== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Placeholder for feature */}
        <div className="w-full md:col-span-2">
        {/* <div className="col-span-2"> */}
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-semibold">[Coming Soon]</p>
              <p className="text-sm">Photos and logo for this chapter will go here</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: About the Chapter */}
        <div className="w-full md:col-span-3 space-y-4">
        {/* <div className="col-span-3 space-y-4"> */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <p>
                <span className="font-semibold">Created:</span>{' '}
                {format(chapter.createdAt, 'MMMM d, yyyy')}
              </p>
              {chapter.description && (
                <p>
                  <span className="font-semibold">About:</span> {chapter.description}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===================== */}
      {/* ZONE 3: Tabs or Accordion */}
      {/* ===================== */}

      <div className="w-full space-y-2">

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="events" className="w-full space-y-2">

            {/* Shared row: Tabs left, Join right */}
            <div className="flex items-center justify-between w-full">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                {(userStatus.mgrMember || userStatus.genMember) && (
                  <TabsTrigger value="membership">My Membership</TabsTrigger>
                )}
              </TabsList>
              <div className="ml-auto flex gap-2">
                {/* <JoinChapterButton anonVisitor={userStatus.anonVisitor} authVisitor={userStatus.authVisitor} /> */}
                <JoinChapterButton 
                  userStatus={userStatus}
                  // chapterId={chapter.id}
                  chapterSlug={slug}
                />

                {/* note: above button/userProfile component and below are mutually exclusive */}
                <CreateEventButton mgrMember={userStatus.mgrMember} slug={slug}  />
              </div>
            </div>

            <TabsContent value="events">
              <EventsTabContent 
                events={events}
                isApprovedMember={isApprovedMember}
                slug={slug}
              />
            </TabsContent>

            <TabsContent value="members">
              <p className="text-muted-foreground italic">[Members Placeholder]</p>
            </TabsContent>

            <TabsContent value="locations">
              <p className="text-muted-foreground italic">[Locations Placeholder]</p>
            </TabsContent>

            {(userStatus.mgrMember || userStatus.genMember) && (
              <TabsContent value="membership">
                <p className="text-muted-foreground italic">[Membership Placeholder]</p>
                {/* <myMembershipTab
                    joinDate={format(chapterMembership.createdAt, 'MMMM d, yyyy')}
                    memberRole={chapterMembership.memberRole}
                    isActive={chapterMembership.status === 'ACTIVE'}
                  /> */}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Mobile Accordion */}
        <div className="block md:hidden space-y-4">
          {/* Action button(s) sit above the accordion */}
          <div className="flex justify-center">
            {/* <JoinChapterButton anonVisitor={userStatus.anonVisitor} authVisitor={userStatus.authVisitor} /> */}
            <JoinChapterButton 
              userStatus={userStatus}
              // chapterId={chapter.id}
              chapterSlug={slug}
            />
            <CreateEventButton mgrMember={userStatus.mgrMember} slug={slug}  />
          </div>

          <Accordion type="single" collapsible className="w-full"> 
            <AccordionItem value="events">
              <AccordionTrigger>Events</AccordionTrigger>
              <AccordionContent>
                <EventsTabContent 
                events={events}
                isApprovedMember={isApprovedMember}
                slug={slug}
              />

              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="members">
              <AccordionTrigger>Members</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground italic">[Members Placeholder]</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="locations">
              <AccordionTrigger>Locations</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground italic">[Locations Placeholder]</p>
              </AccordionContent>
            </AccordionItem>
            {(userStatus.mgrMember || userStatus.genMember) && (
              <AccordionItem value="membership">
                <AccordionTrigger>My Membership</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground italic">[Membership Placeholder]</p>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

    </section>
  );
}
