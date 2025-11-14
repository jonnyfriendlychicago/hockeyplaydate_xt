// components/Event/rsvp/MemberRsvpList.tsx

import { prisma } from '@/lib/prisma';
import { MemberRole } from '@prisma/client';
import { MemberRsvpListClient } from './MemberRsvpListClient';

// devNotes:
// Two-query approach: Prisma doesn't easily support LEFT JOIN with filters, so we fetch members, then RSVPs, then merge. This is clean and performant.
// Alphabetical sorting: Matches your chapter membership pattern
// Type safety: The merged structure matches MemberWithRsvp

interface MemberRsvpListProps {
  chapterId: number;
  // eventId: number;
  eventSlug: string;
  currentUserProfileId: number | null;
  isManager: boolean;
}

export async function MemberRsvpList({
  chapterId,
  // eventId,
  eventSlug,
  currentUserProfileId,
  isManager,
}: MemberRsvpListProps) {

  // Look up event by slug first
  const event = await prisma.event.findUnique({
    where: { presentableId: eventSlug },
    select: { id: true }
  });

  // Guard clause - if event doesn't exist, return empty state
  // (This shouldn't happen since page already validated event exists)
  if (!event) {
    return (
      <MemberRsvpListClient
        members={[]}
        eventSlug={eventSlug}
        currentUserProfileId={currentUserProfileId}
        isManager={isManager}
      />
    );
  }
  
  // Fetch all MEMBER and MANAGER roles from this chapter
  // LEFT JOIN with RSVP data for this specific event
  const members = await prisma.chapterMember.findMany({
    where: {
      chapterId,
      memberRole: {
        in: [MemberRole.MEMBER, MemberRole.MANAGER]
      }
    },
    include: {
      userProfile: {
        select: {
          id: true,
          givenName: true,
          familyName: true,
          slugDefault: true,
          slugVanity: true,
          authUser: {
            select: {
              picture: true
            }
          }
        }
      },
      // LEFT JOIN: Get RSVP if exists for this event
      // Using a subquery approach since we need to filter by eventId
    },
    orderBy: [
      { userProfile: { familyName: 'asc' } },
      { userProfile: { givenName: 'asc' } }
    ]
  });

  // Fetch RSVPs for this event separately, then merge
  // This is cleaner than trying to do complex nested queries
  const rsvps = await prisma.rsvp.findMany({
    where: {
      // eventId,
      eventId: event.id, 
      userProfileId: {
        in: members.map(m => m.userProfileId)
      }
    },
    select: {
      id: true,
      userProfileId: true,
      rsvpStatus: true,
      playersYouth: true,
      playersAdult: true,
      spectatorsAdult: true,
      spectatorsYouth: true,
    }
  });

  // Merge RSVPs into members data
  const membersWithRsvp = members.map(member => {
    const rsvp = rsvps.find(r => r.userProfileId === member.userProfileId);
    return {
      ...member,
      rsvp: rsvp || null
    };
  });

  return (
    <MemberRsvpListClient
      members={membersWithRsvp}
      eventSlug={eventSlug}
      currentUserProfileId={currentUserProfileId}
      isManager={isManager}
    />
  );
}