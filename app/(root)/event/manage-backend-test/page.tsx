// app/(root)/event/manage-backend-test/page.tsx
// this entire file purely for testing backend api; it is not intended for production use by real-life end users

export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ManageEventBackendTestForm from '@/components/Event/ManageEventBackendTestFormTwo';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
// import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
// import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus';
import { Chapter , Event } from '@prisma/client';

// below required to make URL parameters work
interface PageProps {
  searchParams: {
    chapter?: string;
    event?: string;
  };
}

export default async function ManageEventBackendTestPage({ searchParams }: PageProps) {
  if (process.env.ALLOW_BACKEND_TEST_FORM !== 'true') notFound();
  
  // devNotes: below validations commented OUT of this file, to ensure such occurs successfully in the route.ts.  
  // Below kept for reference: something like this should be in the production user-facing edit page

  // 0 - Validate user, part 1: authenticated not-dupe user? 
  // const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull();
  // // bounce if not authenticated 
  // if (!authenticatedUserProfile) {
  //   return redirect('/auth/login');
  // }
  // // bounce if dupe user 
  // if (authenticatedUserProfile?.authUser.duplicateOfId) {
  //   return redirect('/');
  // }
  
  // 1 - establish essential vars
  let parentChapter: Chapter | null = null;
  let existingEvent: (Event & { chapter: Chapter }) | null = null;
  let pageMode: 'create' | 'edit' = 'create';
  const chapterSlug = searchParams.chapter;
  const eventSlug = searchParams.event;
  
  // 2 - determine path: create or edit? (various downstream implications)
  if (eventSlug) {
    pageMode = 'edit';
    
    existingEvent = await prisma.event.findFirst({
      where: { presentableId: eventSlug },
      include: { chapter: true },
    });
    
    // if can't find an event, we have nothing to edit, so bounce
    if (!existingEvent) {
      notFound();
    }
    // set the parentChapter based on the found event
    parentChapter = existingEvent.chapter; 

  } else if (chapterSlug) {
    pageMode = 'create';
    
    // no event to be found/set yet, b/c we are creating it on this path, obviously

    parentChapter = await prisma.chapter.findFirst({ where: { slug: chapterSlug } }); // here, we set the parentChapter based on the chapter parameter
    
    // if can't find the parentChapter, we can't create (b/c parentChapter is an essential immutable field), so bounce
    if (!parentChapter) {
      notFound();
    }
  } else {
    // if neither, something totally busted with URL/parameter, so bounce.  
    notFound();
  }

  // devNotes: below validations commented OUT of this file, to ensure such occurs successfully in the route.ts.  
  // Below kept for reference: something like this should be in the production user-facing edit page

  // 3 - Validate user, part 2: requisite chapterMember permissions? 
  // get userChapterStatus
  // const userStatus = await getUserChapterStatus(
  //   parentChapter.id, 
  //   authenticatedUserProfile
  // );
  // // Redirect anyone who is not a chapter manager; redirect is blunt and that's fine: no one who is not a manager of this chapter/event should ever be on this page.
  // if (!userStatus.mgrMember) {
  //   return redirect('/');
  // }

  // 4 - Normalize nullable fields for prop shape compliance, i.e. empty strings v. nulls
  // devNote: this is presented as a ternary: event flow is both create and edit, and in create, there's not existing event data, so it's null


  // 2025aug21: below replaced by following new section, attempt to resolve persistent event maps bug: places lookup won't work on toggle from manual entry
        // const normalizedEventData = existingEvent ? {
        //   // note: we do not use `... existingEvent` (like userProfile mgmt) b/c our form is not going to be managing all fields
        //   eventId: existingEvent.id,
        //   chapterId: existingEvent.chapterId,
        //   title: existingEvent.title ?? '',
        //   description: existingEvent.description ?? '',
        //   placeId: existingEvent.placeId ?? '',
        //   venueName: existingEvent.venueName ?? '',
        //   address: existingEvent.address ?? '',
        //   lat: existingEvent.lat?.toString() ?? '',
        //   lng: existingEvent.lng?.toString() ?? '',
        //   startsAt: existingEvent.startsAt?.toISOString().slice(0, 16) ?? '',
        //   durationMin: existingEvent.durationMin?.toString() ?? '',
        //   bypassAddressValidation: existingEvent.bypassAddressValidation ?? false,
        // } : null;

  const normalizedEventData = existingEvent ? {
  eventId: existingEvent.id,
  chapterId: existingEvent.chapterId,
  title: existingEvent.title ?? '',
  description: existingEvent.description ?? '',
  placeId: existingEvent.placeId ?? '',
  lat: existingEvent.lat?.toString() ?? '',
  lng: existingEvent.lng?.toString() ?? '',
  startsAt: existingEvent.startsAt?.toISOString().slice(0, 16) ?? '',
  durationMin: existingEvent.durationMin?.toString() ?? '',
  bypassAddressValidation: existingEvent.bypassAddressValidation ?? false,
  
  // NEW: Map old fields to new field structure
  venueName: existingEvent.venueName ?? '',    // Keep for backward compatibility
  address: existingEvent.address ?? '',        // Keep for backward compatibility
} : null;

  // 5 - return it all
  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-end">
        {pageMode === 'create' ? (
          <Link href={`/${parentChapter.slug}`}>  
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 hover:bg-red-50">
              <CircleX className="w-4 h-4 text-destructive" />
              <span className="text-destructive">Cancel</span>
            </Button>
          </Link>
          ) : (
          <Link href={`/event/${eventSlug}`}>  
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 hover:bg-red-50">
              <CircleX className="w-4 h-4 text-destructive" />
              <span className="text-destructive">Cancel</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="col-span-2 flex flex-col items-center justify-center gap-4">
          <p>hello placeholder!</p>
        </div>

        <div className="col-span-3">
          <Card className="h-full bg-black border">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <h1 className='bg-slate-600'>THIS ENTIRE PAGE/FORM IS FOR TESTING EVENT BACKEND ONLY</h1>
              <p className="mt-2 text-sm">
                {pageMode === 'create' ? 'Create' : 'Edit'} events - backend validation testing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full">
        <ManageEventBackendTestForm
          chapterId={parentChapter.id}
          // initialEventData={normalizedEventData}
          // devNote: below instead of above, b/c in 'create' path, there's no existing event data to throw over via props
          // ... and below coding follows React conventions (undefined = no prop)
          initialEventData={normalizedEventData || undefined}
        />
      </div>
    </section>
  );
}