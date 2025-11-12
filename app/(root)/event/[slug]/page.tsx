// app/(root)/event/[slug]/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Calendar, MapPin, Clock, AlertTriangle, Building2 , UserCheck } from 'lucide-react';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { CopyText } from '@/components/shared/copyText';
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus';
import EventLocationMap from '@/components/Event/EventLocationMap';
import AddToGoogleCalendar from '@/components/Event/AddToGoogleCalendar';
import { MyRsvpCard } from '@/components/Event/rsvp/MyRsvpCard';
import { RsvpSummary } from '@/components/Event/rsvp/RsvpSummary';
import { EventErrorDisplay } from '@/components/Event/EventErrorDisplay';
import { MemberRsvpList } from '@/components/Event/rsvp/MemberRsvpList';

export default async function EventPage({ params }: { params: { slug: string } }) {
  // devNotes for future: maybe expand getAuthenticated into accepting a "desired result", i.e.,  if auth fails: sendHome; loginRedirect; getNull; etc. 
  // 0 - Validate user, part 1: authenticated not-dupe user? 
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

  // 0.1 // redirect not authenticated / anon user; events are fully protected pages. 
  if (!authenticatedUserProfile) { 
      const returnTo = `/event/${params.slug}`;
      redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    }

  // 1 - validate event 
  const presentedEvent = await prisma.event.findFirst({
    where: {
      presentableId: params.slug,
    },
    include: {
      chapter: true,
      rsvps: {
        include: {
          userProfile: true,
        },
      },
    },
  });

  // redirect if no exists
  if (!presentedEvent) {
    console.log('!presentedEvent issue' )
    notFound(); // future consideration: special return or redirect: "no such event, dude!"
  }

  // 2 - Validate user, part 2: requisite chapterMember permissions? 
  const userStatus = await getUserChapterStatus(
    presentedEvent.chapter.id, 
    authenticatedUserProfile
  );

  // 2025nov08: let's use below as opportunity to exploit the enum file for chapterMembers, rather than using those bang boolean fields. 
  if (!(userStatus.mgrMember || userStatus.genMember)) {
    // devNotes: above reads very simple: if not (this OR that), then do such and such
    // way more intuitive than if not this and not that, then do such and such
    return (
      <section className="max-w-6xl mx-auto p-6 text-center py-12">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          Sorry, you do not have permission to view this event.
        </p>
        <p className="text-sm text-muted-foreground">
          You can only view events of sponsored by chapter you belong to.
        </p>
        <p className="text-muted-foreground mb-4 py-4">
          Explore chapters to find a good fit for your family.
        </p>
      </section>
    );
  }

  // 3 - data presention helpers
  // 3a - format date/time 
  const formatEventDateTime = (date: Date | null) => {
    if (!date) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',   
      timeZoneName: 'short',
    }).format(date);
  };

  // 3b - format end time (instead of duration)
  const formatEndTime = (endDate: Date | null) => {
    if (!endDate) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
      timeZoneName: 'short',
    }).format(endDate);
  };

  // 3d - Get current user's RSVP status
  const userRsvp = authenticatedUserProfile 
    ? presentedEvent.rsvps.find(rsvp => rsvp.userProfileId === authenticatedUserProfile.id)
    : null;
  const userRsvpStatus = userRsvp?.rsvpStatus || null;

  // 4 - return it all
  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Bar - Chapter Name + Edit Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <Link 
            href={`/${presentedEvent.chapter.slug}`}
            className="text-lg font-medium text-primary hover:underline flex items-center gap-1"
          >
            {presentedEvent.chapter.name || 'Chapter'}
          </Link>
        </div>
        
        {/* Edit Button - only for managers */}
        {userStatus.mgrMember && (
          <Link href={`/event/manage-backend-test?event=${presentedEvent.presentableId}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <Pencil className="w-4 h-4" />
              Edit Event
            </Button>
          </Link>
        )}
      </div>

      {/* Event Title */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {presentedEvent.title || 'Untitled Event'}
        </h1>
      </div>

      {/* CHANGE: NEW - Event Status Banner placeholder for future CANC status */}
      {/* Event Status Banner - placeholder for future CANC status */}
      {/* Future: Uncomment when event.status field is added to schema */}
      {/* {presentedEvent.status === 'CANC' && (
        <div className="w-full bg-red-600 text-white p-4 rounded-lg">
          <div className="flex items-center gap-2 justify-center">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-lg">EVENT CANCELLED</span>
          </div>
          {presentedEvent.statusComment && (
            <p className="text-center mt-2">{presentedEvent.statusComment}</p>
          )}
        </div>
      )} */}

      <EventErrorDisplay />

      {/* My RSVP Row  */}
      <MyRsvpCard 
        eventId={presentedEvent.id} // 2025nov10: we should not be passing eventId, should only be passing eventSlug.  investigate. 
        eventSlug={presentedEvent.presentableId}
        userProfileId={authenticatedUserProfile.id}
      />

      {/* Row 1: Event Details + RSVP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{formatEventDateTime(presentedEvent.startsAt)}</p>
                  <CopyText text={formatEventDateTime(presentedEvent.startsAt)} />
                </div>
                {/* Multi-day detection and end time display */}
                {presentedEvent.endsAt && (() => {
                  const startDate = presentedEvent.startsAt?.toDateString();
                  const endDate = presentedEvent.endsAt.toDateString();
                  const isMultiDay = startDate !== endDate;
                  
                  return (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Ends: {isMultiDay ? formatEventDateTime(presentedEvent.endsAt) : formatEndTime(presentedEvent.endsAt)}
                      </p>
                      {isMultiDay && (
                        <p className="text-sm text-red-600 font-medium mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          NOTE: Multi-day event detected
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Location */}
            {(presentedEvent.venueName || presentedEvent.address) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  {presentedEvent.venueName && (
                    <p className="font-semibold">{presentedEvent.venueName}</p>
                  )}
                  {presentedEvent.address && (
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-muted-foreground">{presentedEvent.address}</p>
                      <CopyText text={presentedEvent.address} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {presentedEvent.description && (
              <div>
                <p className="text-sm">{presentedEvent.description}</p>
              </div>
            )}

            {/* Add to Calendar Button */}
            <div className="pt-4">
              <AddToGoogleCalendar
                event={{
                  title: presentedEvent.title || 'Hockey Event',
                  description: presentedEvent.description || undefined,
                  venueName: presentedEvent.venueName || undefined,
                  address: presentedEvent.address || undefined,
                  startsAt: presentedEvent.startsAt,
                  endsAt: presentedEvent.endsAt,
                }}
                userRsvpStatus={userRsvpStatus}
                // className="bg-blue-600 hover:bg-blue-700 text-white"
                // 2025oct28 Line above encountering errors, revisit
              />
            </div>
          </CardContent>
        </Card>
      
        <RsvpSummary 
          eventId={presentedEvent.id} // 2025nov10: we should not be passing eventId, should only be passing eventSlug.  investigate. 
        />
      </div>

      {/* Row 2: Location (Full Width) */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Location Map */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <EventLocationMap
              venueName={presentedEvent.venueName}
              address={presentedEvent.address}
              placeId={presentedEvent.placeId}
              lat={presentedEvent.lat}
              lng={presentedEvent.lng}
              bypassAddressValidation={presentedEvent.bypassAddressValidation}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Member RSVP Status */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              RSVP Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemberRsvpList
              chapterId={presentedEvent.chapterId}
              eventId={presentedEvent.id}
              eventSlug={presentedEvent.presentableId}
              currentUserProfileId={authenticatedUserProfile.id}
              isManager={userStatus.mgrMember}
            />
            
            {/* <div className="bg-muted/30 p-12 rounded-lg text-center">
              <UserCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Placeholder content - Member RSVP list placeholder
              </p>
              <p className="text-xs text-muted-foreground">
                Chapter member list with RSVP statuses and tabs (All, Yes, No, Maybe, No Reply)
              </p>
              {userStatus.mgrMember && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Manager view: Will allow editing member RSVPs
                </p>
              )}
            </div> */}

          </CardContent>
        </Card>
      </div>

    </section>
    );
}
