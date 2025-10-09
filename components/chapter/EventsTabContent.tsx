// components/chapter/EventsTabContent.tsx

"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ChevronDown, ChevronUp} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Event
  , RsvpStatus
} from '@prisma/client';

type EventWithRsvps = Event & {
  rsvps: {
    id: number;
    rsvpStatus: RsvpStatus | null;
    userProfileId: number | null;
  }[];
};

interface EventsTabContentProps {
  events: EventWithRsvps[];
  isApprovedMember: boolean; // MEMBER or MANAGER roles
  slug: string; // for navigation to individual events
}

export function EventsTabContent({ 
  events, 
  isApprovedMember
}: EventsTabContentProps) {
  
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);

  // Helper function to truncate description
  const truncateDescription = (description: string | null, maxLength: number = 100): string => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  // Helper function to get attending count
  const getAttendingCount = (event: EventWithRsvps): number => {
    return event.rsvps.filter(rsvp => rsvp.rsvpStatus === 'YES').length;
  };

  // Separate and sort events
  const now = new Date();
  const upcomingEvents = events
    .filter(event => !event.startsAt || event.startsAt > now)
    .sort((a, b) => {
      if (!a.startsAt) return 1;
      if (!b.startsAt) return -1;
      return a.startsAt.getTime() - b.startsAt.getTime();
    });
  
  const pastEvents = events
    .filter(event => event.startsAt && event.startsAt <= now)
    .sort((a, b) => b.startsAt!.getTime() - a.startsAt!.getTime());

  // For non-approved members, only show most recent 3 past events
  const displayedPastEvents = isApprovedMember 
    ? (showAllPast ? pastEvents : pastEvents.slice(0, 3))
    : pastEvents.slice(0, 3);

  const displayedUpcomingEvents = showAllUpcoming 
    ? upcomingEvents 
    : upcomingEvents.slice(0, 3);

  // Non-approved member experience
  if (!isApprovedMember) {
    return (
      <div className="space-y-6">
        {/* Blurb */}
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                This chapter has held <span className="font-semibold">{pastEvents.length}</span> playdates, 
                and has <span className="font-semibold">{upcomingEvents.length}</span> coming up. 
                <br/>
                Join this chapter to access the full list/details 
                of past and planned events.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Past Events (limited view) */}
        {displayedPastEvents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Events</h3>
            <div className="space-y-3">
              {displayedPastEvents.map((event) => (
                <Card key={event.id} >
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-3">
                      {/* Event Title */}
                      <h4 className="font-semibold text-sm sm:text-base">
                        {event.title || 'Untitled Event'}
                      </h4>

                      {/* Date - Month/Year only for non-members */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {event.startsAt ? format(event.startsAt, 'MMMM yyyy') : 'Date TBD'}
                        </span>
                      </div>

                      {/* Venue & Address */}
                      {(event.venueName || event.address) && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            {event.venueName && (
                              <div className="font-medium text-foreground">{event.venueName}</div>
                            )}
                            {event.address && (
                              <div className="text-xs sm:text-sm">{event.address}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {truncateDescription(event.description, 100)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Approved member experience
  return (
    <div className="space-y-6">
      
      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Upcoming Events ({upcomingEvents.length})
            </h3>
          </div>

          <div className="space-y-3">
            {displayedUpcomingEvents.map((event) => (
              <Link key={event.id} href={`/event/${event.presentableId}`}>
                <Card className="mt-4 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-3">
                      {/* Event Title */}
                      <h4 className="font-semibold text-sm sm:text-base">
                        {event.title || 'Untitled Event'}
                      </h4>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {event.startsAt 
                            ? `${format(event.startsAt, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}${event.durationMin ? ` (${event.durationMin} min)` : ''}`
                            : 'Date & Time TBD'
                          }
                        </span>
                      </div>

                      {/* Venue & Address */}
                      {(event.venueName || event.address) && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            {event.venueName && (
                              <div className="font-medium text-foreground">{event.venueName}</div>
                            )}
                            {event.address && (
                              <div className="text-xs sm:text-sm">{event.address}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {truncateDescription(event.description, 100)}
                        </p>
                      )}

                      {/* Attendance Count */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-muted">
                        <Users className="w-4 h-4" />
                        <span>{getAttendingCount(event)} attending</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <div className="flex items-center justify-between">

            {upcomingEvents.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                className="flex items-center gap-2"
              >
                {showAllUpcoming ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All {upcomingEvents.length}
                  </>
                )}
              </Button>
            )}
          </div>
          </div>
        </div>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Past Events ({pastEvents.length})
            </h3>
          </div>

          <div className="space-y-3">
            {displayedPastEvents.map((event) => (
              <Link key={event.id} href={`/event/${event.presentableId}`}>
                <Card className="mt-4 hover:shadow-md transition-shadow cursor-pointer opacity-90">
                  <CardContent className="p-4 sm:p-5">
                    <div className="space-y-3">
                      {/* Event Title with Past Badge */}
                      <div className="flex items-start gap-2">
                        <h4 className="font-semibold text-sm sm:text-base flex-1">
                          {event.title || 'Untitled Event'}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Past
                        </Badge>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {event.startsAt 
                            ? `${format(event.startsAt, 'EEEE, MMMM d, yyyy \'at\' h:mm a')}${event.durationMin ? ` (${event.durationMin} min)` : ''}`
                            : 'Date & Time TBD'
                          }
                        </span>
                      </div>

                      {/* Venue & Address */}
                      {(event.venueName || event.address) && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            {event.venueName && (
                              <div className="font-medium text-foreground">{event.venueName}</div>
                            )}
                            {event.address && (
                              <div className="text-xs sm:text-sm">{event.address}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {truncateDescription(event.description, 100)}
                        </p>
                      )}

                      {/* Attendance Count */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-muted">
                        <Users className="w-4 h-4" />
                        <span>{getAttendingCount(event)} attended</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <div className="flex items-center justify-between">
            {pastEvents.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllPast(!showAllPast)}
                className="flex items-center gap-2"
              >
                {showAllPast ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show 3 Most Recent
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All {pastEvents.length}
                  </>
                )}
              </Button>
            )}
          </div>
          </div>
        </div>
      )}

      {/* No Events State */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="text-lg font-medium">No Events Yet</p>
                <p className="text-sm text-muted-foreground">
                  This chapter hasn&apos;t scheduled any events yet. Check back soon!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}