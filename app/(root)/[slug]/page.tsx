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
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion"
import { JoinChapterButton } from '@/components/chapter/JoinChapterButton';
import { BlockedNotice } from '@/components/chapter/BlockedNotice';
import { getUserDisplayName } from "@/lib/helpers/getUserDisplayName";
import { CreateEventButton } from "@/components/chapter/CreateEventButton";
// import { redirect } from 'next/navigation';
import { EventsTabContent } from '@/components/chapter/EventsTabContent';
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus';
import { ChapterMembersList } from '@/components/chapter/ChapterMembersList';
import { MembershipTab } from '@/components/chapter/MembershipTab';
import { ChapterErrorDisplay } from '@/components/chapter/ChapterErrorDisplay';

// import { maskName } from '@/lib/helpers/maskName'; // new helper function you should create
// import { myMembershipTab } from '@/components/chapter/myMembershipTab';

// export const dynamic = 'force-dynamic';

export default async function ChapterPage({ params }: { params: { slug: string } }) {
  
  // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
  const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

  // At the very top of ChapterPage function, after getting authenticatedUserProfile:
  console.log('[ChapterPage] Rendering, user:', authenticatedUserProfile?.id);
  
  // 1 - load chapter v. notFound
  const slug = params.slug;
  const chapter = await prisma.chapter.findUnique({
    where: { slug },
  });

  if (!chapter) notFound();

  // 1.1 - load events (with accompanying RSVPs) for this chapter
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
  
  // 2 - Validate user, part 2: determine chapterMember permissions
  const userChapterMember = await getUserChapterStatus(
    chapter.id, 
    authenticatedUserProfile
  );

  // 3 - Display logic for obfuscated organizer names if unauthenticated
  // const organizerNames = chapter.members.map((m) => {
  //   const name = `${m.userProfile?.givenName ?? ''} ${m.userProfile?.familyName ?? ''}`.trim();
  //   return authUser ? name : maskName(name);
  // });

  // 4 - other variables
  const authenticatedUserProfileNameString = getUserDisplayName(authenticatedUserProfile);

  const isApprovedMember = userChapterMember.genMember || userChapterMember.mgrMember; // handy short cut on whether to display/not simple stuff

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* ===================== */}
      {/* ZONE 1: Header & Edit */}
      {/* ===================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-primary text-center md:text-left">
          {chapter.name} Chapter
        </h1>

        {/* Top Right Edit Button (href update needed, once edit-chapter program has been set-up) */}
        {userChapterMember.mgrMember && (
          <Link href={`/${slug}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <Pencil className="w-4 h-4" />
              Edit Chapter Info
            </Button>
          </Link>
        )}
      </div>
      
      {/* ===================== */}
      {/* ZONE 1.1: Global Error Display */}
      {/* ===================== */}
      <ChapterErrorDisplay />

      {/* ===================== */}
      {/* ZONE 1.2: Blocked Notice */}
      {/* ===================== */}
      {userChapterMember.blockedMember && 
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
      {/* ZONE 3: Desktop Tabs v Mobile Accordion */}
      {/* ===================== */}

      {/* <div className="w-full space-y-2"> */}
      <div className="w-full space-y-4">

        {/* Action buttons - ALWAYS visible, only rendered ONCE */}
        <div className="flex justify-end gap-2">
          <JoinChapterButton 
            userChapterMember={userChapterMember}
            chapterSlug={slug}
          />
          <CreateEventButton mgrMember={userChapterMember.mgrMember} slug={slug} />
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="locations" className="w-full space-y-2">

            {/* Shared row: Tabs left, Join right */}
            {/* <div className="flex items-center justify-between w-full"> */}
            {/* 2025oct18: above div helped space out the tabs from the button, but we're not doing that anymore, so nevermind */}
              <TabsList className="flex flex-wrap gap-2 justify-start">

                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                {userChapterMember.mgrMember && 
                  <>
                    <TabsTrigger value="applicants">Applicants</TabsTrigger>
                    <TabsTrigger value="restricted">Restricted</TabsTrigger>
                  </>
                  }

                {isApprovedMember && 
                  <TabsTrigger value="membership">My Membership</TabsTrigger>
                }
              </TabsList>

              {/* 2025oct18: Action button(s) WOULD sit right of the tabs if we kept it below, but we're done with that.*/}

              {/* <div className="ml-auto flex gap-2">
                <JoinChapterButton 
                  userChapterMember={userChapterMember}
                  chapterSlug={slug}
                />
                <CreateEventButton mgrMember={userChapterMember.mgrMember} slug={slug}  />
              </div> */}

            {/* </div> */}

            {/* tabs content */}

            <TabsContent value="locations">
              <p className="text-muted-foreground italic">[Locations Placeholder]</p>
            </TabsContent>

            <TabsContent value="events">
              <EventsTabContent 
                events={events}
                isApprovedMember={isApprovedMember}
                slug={slug}
              />
            </TabsContent>

            <TabsContent value="members">
              <ChapterMembersList 
                chapterId={chapter.id}
                userChapterMember={userChapterMember}
                filter="members"
              />
            </TabsContent>

            {userChapterMember.mgrMember && 
              <>
                <TabsContent value="applicants">
                  <ChapterMembersList 
                    chapterId={chapter.id}
                    userChapterMember={userChapterMember}
                    filter="applicants"
                  />
                </TabsContent>
                
                <TabsContent value="restricted">
                  <ChapterMembersList 
                    chapterId={chapter.id}
                    userChapterMember={userChapterMember}
                    filter="restricted"
                  />
                </TabsContent>
              </>
            }

            {isApprovedMember && 
              <TabsContent value="membership">
                <MembershipTab 
                  chapterId={chapter.id}
                  userChapterMember={userChapterMember}
                />
              </TabsContent>
            }
          </Tabs>
        </div>

        {/* Mobile Accordion */}

        <div className="block md:hidden space-y-4">
          {/* 2025oct18: hack up noted above; Action button(s) sit above the accordion */}
          {/* <div className="flex justify-center">
            <JoinChapterButton 
              userChapterMember={userChapterMember}
              chapterSlug={slug}
            />
            <CreateEventButton mgrMember={userChapterMember.mgrMember} slug={slug}  />
          </div> */}

          <Accordion type="single" collapsible className="w-full"> 
            
            <AccordionItem value="locations">
              <AccordionTrigger>Locations</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground italic">[Locations Placeholder]</p>
              </AccordionContent>
            </AccordionItem>

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
                <ChapterMembersList 
                chapterId={chapter.id}
                userChapterMember={userChapterMember}
                filter="members"
              />
              </AccordionContent>
            </AccordionItem>

            {userChapterMember.mgrMember && 
            <>
              <AccordionItem value="applicants">
                <AccordionTrigger>Applicants</AccordionTrigger>
                <AccordionContent>
                  <ChapterMembersList 
                    chapterId={chapter.id}
                    userChapterMember={userChapterMember}
                    filter="applicants"
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="restricted">
                <AccordionTrigger>Restricted</AccordionTrigger>
                <AccordionContent>
                  <ChapterMembersList 
                    chapterId={chapter.id}
                    userChapterMember={userChapterMember}
                    filter="restricted"
                  />
                </AccordionContent>
              </AccordionItem>
            </>
          }

          {isApprovedMember && 
            <AccordionItem value="membership">
              <AccordionTrigger>My Membership</AccordionTrigger>
              <AccordionContent>
                <MembershipTab
                  chapterId={chapter.id}
                  userChapterMember={userChapterMember}
                />
              </AccordionContent>
            </AccordionItem>
          }

          </Accordion>
        </div>
      </div>

    </section>
  );
}
