// components/Event/rsvp/MemberRsvpList.tsx

import { prisma } from '@/lib/prisma';
import { MemberRole } from '@prisma/client';
import { MemberRsvpListClient } from './MemberRsvpListClient';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';

// devNotes:
// Two-query approach: Prisma doesn't easily support LEFT JOIN with filters, so we fetch members, then RSVPs, then merge. This is clean and performant.
// Alphabetical sorting: Matches your chapter membership pattern
// Type safety: The merged structure matches MemberWithRsvp

interface MemberRsvpListProps {
  // chapterSlug: string; 
  eventSlug: string;
  // chapterId: number;
  // eventId: number;
  // currentUserProfileId: number | null;
  // isManager: boolean;
}

export async function MemberRsvpList({
  // chapterSlug,
  eventSlug,
  // chapterId,
  // eventId,
  // currentUserProfileId,
  // isManager,
}: MemberRsvpListProps) {

  // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
  const  authenticatedUserProfile = await getAuthenticatedUserProfileOrNull(); 

  // Look up chapter by slug
  // const chapter = await prisma.chapter.findUnique({
  //   where: { slug: chapterSlug },
  //   select: { id: true }
  // });

  // // Guard clause - if chapter doesn't exist, return empty state
  // if (!chapter) {
  //   return (
  //     <MemberRsvpListClient
  //       members={[]}
  //       eventSlug={eventSlug}
  //       currentUserProfileId={null}
  //       isManager={false}
  //     />
  //   );
  // }
  
  // 1 - Look up event by slug 
  const event = await prisma.event.findUnique({
    where: { presentableId: eventSlug },
    select: { 
      id: true , 
      chapterId: true  // Get chapterId from event!
    }
  });

  // Guard clause - if event doesn't exist, return empty state.   This shouldn't happen since page already validated event exists. 
  if (!event) {
    return (
      <MemberRsvpListClient
        members={[]}
        eventSlug={eventSlug}
        // currentUserProfileId={null}
        isManager={false}
      />
    );
  }
  
  // 2 - Look up current user's membership to determine manager status
  const membership = authenticatedUserProfile 
    ? await prisma.chapterMember.findFirst({
        where: {
          userProfileId: authenticatedUserProfile.id,
          chapterId: event.chapterId,
        },
      })
    : null;

  const isManager = membership?.memberRole === MemberRole.MANAGER;
  const currentUserProfileId = authenticatedUserProfile?.id || null;

  // 3 - fetch target data
  // 3.1 - Fetch all MEMBER and MANAGER roles from this chapter
  const members = await prisma.chapterMember.findMany({
    where: {
      // chapterId,
      chapterId: event.chapterId,
      memberRole: {
        in: [MemberRole.MEMBER, MemberRole.MANAGER]
      }
    },
    // include: {
    select: {  //  Change from 'include' to 'select' for precision, and add individual fields below
      id: true,  // Used internally for joins
      presentableId: true,  // ADD THIS - for client
      memberRole: true,
      joinedAt: true,
      userProfileId: true,  // Used internally for joins  
      userProfile: {
        select: {
          id: true, // Used internally for joins  
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
    },
    orderBy: [
      { userProfile: { familyName: 'asc' } },
      { userProfile: { givenName: 'asc' } }
    ]
  });

  // 3.2 - Fetch RSVPs for this event 
  const rsvps = await prisma.rsvp.findMany({
    where: {
      // eventId,
      eventId: event.id, 
      userProfileId: {
        in: members.map(m => m.userProfileId)
      }
    },
    select: {
      // id: true,
      presentableId: true,
      userProfileId: true, // used for joining
      rsvpStatus: true,
      playersYouth: true,
      playersAdult: true,
      spectatorsAdult: true,
      spectatorsYouth: true,
    }
  });

  // 3.3 Merge RSVPs into members data ... and strip database IDs before sending to client
  const membersWithRsvp = members.map(member => {
    const rsvp = rsvps.find(r => r.userProfileId === member.userProfileId);
    const isCurrentUser = currentUserProfileId === member.userProfileId;
    return {
      isCurrentUser,  //  Pass boolean flag instead of ID
      // ...member,
      // rsvp: rsvp || null , 
      //  above replaced by below: only include public-safe fields
      presentableId: member.presentableId,
      memberRole: member.memberRole,
      joinedAt: member.joinedAt,
      userProfile: {
        givenName: member.userProfile.givenName,
        familyName: member.userProfile.familyName,
        slugDefault: member.userProfile.slugDefault,
        slugVanity: member.userProfile.slugVanity,
        authUser: member.userProfile.authUser,
      },
      rsvp: rsvp ? {
        presentableId: rsvp.presentableId,
        rsvpStatus: rsvp.rsvpStatus,
        playersYouth: rsvp.playersYouth,
        playersAdult: rsvp.playersAdult,
        spectatorsAdult: rsvp.spectatorsAdult,
        spectatorsYouth: rsvp.spectatorsYouth,
      } : null,
    };
  });

  return (
    <MemberRsvpListClient
      members={membersWithRsvp}
      eventSlug={eventSlug}
      // currentUserProfileId={currentUserProfileId}
      isManager={isManager}
    />
  );
}