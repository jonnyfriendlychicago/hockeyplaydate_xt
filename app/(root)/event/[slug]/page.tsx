// app/(root)/event/[slug]/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { CopyText } from '@/components/shared/copyText';
import { getUserChapterStatus } from '@/lib/helpers/getUserChapterStatus';
import EventLocationMap from '@/components/Event/EventLocationMap';
import { AlertTriangle } from 'lucide-react';
import AddToGoogleCalendar from '@/components/Event/AddToGoogleCalendar';

export default async function EventPage({ params }: { params: { slug: string } }) {
  
  // devNotes for future: maybe expand getAuthenticated into accepting a "desired result", i.e.,  if auth fails: sendHome; loginRedirect; getNull; etc. 
  // 0 - Validate user, part 1: authenticated not-dupe user? 
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

  // bounce if dupe user 
  // devNotes: this is an 'every site page' kind of thing.  can this be incorporated into getAuthenticatedUserProfileOrNull ? 
  if (authenticatedUserProfile?.authUser.duplicateOfId) {
    return redirect('/');
  }

  // 1 - find the event 
  // devNotes: we don't import that from the prisma schema. does anyone care?  doesn't seem to make a difference
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

  if (!(userStatus.mgrMember || userStatus.genMember)) {
    // devNotes: above reads very simple: if not (this OR that), then do such and such
    // way more intuitive than if not this and not that, then do such and such
    notFound();
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

  // format end time (instead of duration)
const formatEndTime = (endDate: Date | null) => {
  if (!endDate) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  }).format(endDate);
};

  // 3b - RSVP counts
  const rsvpCounts = {
    yes: presentedEvent.rsvps.filter(rsvp => rsvp.rsvpStatus === 'YES').length,
    no: presentedEvent.rsvps.filter(rsvp => rsvp.rsvpStatus === 'NO').length,
    maybe: presentedEvent.rsvps.filter(rsvp => rsvp.rsvpStatus === 'MAYBE').length,
  };

  // 3c - Get current user's RSVP status
  const userRsvp = authenticatedUserProfile 
    ? presentedEvent.rsvps.find(rsvp => rsvp.userProfileId === authenticatedUserProfile.id)
    : null;
  const userRsvpStatus = userRsvp?.rsvpStatus || null;

  // 4 - return it all.. WHO THE HELL KNOWS WHAT THIS IS GONNA LOOK LIKE! REVISIT
  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Edit Button Top-Right - only for managers */}
      {userStatus.mgrMember && (
        <div className="flex justify-end">
          <Link href={`/event/manage-backend-test?event=${presentedEvent.presentableId}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <Pencil className="w-4 h-4" />
              Edit Event
            </Button>
          </Link>
        </div>
      )}

      {/* Event Title & chapterLink */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {presentedEvent.title || 'Untitled Event'}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          <Link 
            href={`/${presentedEvent.chapter.slug}`}
            className="hover:underline"
          >
          Go to Chapter
          </Link>
        </p>
      </div>

      {/* Top Row: Event Details + RSVP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Left: Event Details */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  
                  {/* <p className="font-medium">{formatEventDateTime(presentedEvent.startsAt)}</p>
                  {presentedEvent.durationMin && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {formatDuration(presentedEvent.durationMin)}
                    </p>
                  )} */}

                  {/* NEW CODE - show end time instead of duration */}
                  {/* <p className="font-medium">{formatEventDateTime(presentedEvent.startsAt)}</p>
                  {presentedEvent.endsAt && (
                    <p className="text-sm text-muted-foreground">
                      Ends: {formatEndTime(presentedEvent.endsAt)}
                    </p>
                  )} */}

                  {/* // NEW CODE - with multi-day detection */}
                  <p className="font-medium">{formatEventDateTime(presentedEvent.startsAt)}</p>
                  {presentedEvent.endsAt && (() => {
                    // Check if same date
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
                      <p className="font-medium">{presentedEvent.venueName}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{presentedEvent.description}</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right: RSVP Summary */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Going</span>
                  <span className="text-lg font-bold text-green-700">{rsvpCounts.yes}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-yellow-700">Maybe</span>
                  <span className="text-lg font-bold text-yellow-700">{rsvpCounts.maybe}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-700">Not Going</span>
                  <span className="text-lg font-bold text-red-700">{rsvpCounts.no}</span>
                </div>
              </div>

              {/* RSVP Button - only show for non-blocked members */}
              {/* placeholder for now */}
              {(userStatus.genMember || userStatus.mgrMember) && (
                <div className="pt-4">
                  <Button className="w-full" size="lg">
                    Update My RSVP
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Calendar Integration + Location Map (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Add to Calendar</CardTitle>
          </CardHeader>
          <CardContent>
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
            />
          </CardContent>
        </Card>

        {/* Location Map */}
        <Card>
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

    </section>
  );
}