// components/Event/rsvp/MyRsvpCard.tsx

import { prisma } from "@/lib/prisma";
import { MyRsvpCardClient } from "./MyRsvpCardClient";
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification'

interface MyRsvpCardProps {
  eventSlug: string;
}

export async function MyRsvpCard({ 
  eventSlug, 
}: MyRsvpCardProps) {

  // 0 - Validate user, part 1: authenticated not-dupe user? 
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull()

  // Guard clause: If no authenticated user, return empty state.  This prevents TS errors downstream. 
  // We use empty state return (instead of redirect the redirect) since the parent page already handles auth. This component should gracefully degrade, not redirect.
  if (!authenticatedUserProfile) {
    return (
      <MyRsvpCardClient 
        userRsvp={null}
        eventSlug={eventSlug}
      />
    );
  }

  // 1 - Look up event by slug 
  const event = await prisma.event.findUnique({
    where: { presentableId: eventSlug },
    select: { id: true }
  });

  // If no event found, return null/empty state
  // (This shouldn't happen since page already validated event exists)
  if (!event) {
    return (
      <MyRsvpCardClient 
        userRsvp={null}
        eventSlug={eventSlug}
      />
    );
  }
  
  // 2 - Fetch user's RSVP for this event
  const userRsvp = await prisma.rsvp.findFirst({
    where: {
      eventId: event.id,
      userProfileId: authenticatedUserProfile.id
    },
    select: {
      presentableId: true, 
      rsvpStatus: true,
      playersYouth: true,
      playersAdult: true,
      spectatorsAdult: true,
      spectatorsYouth: true,
    }
  });

  return (
    <MyRsvpCardClient 
      userRsvp={userRsvp}
      eventSlug={eventSlug}
    />
  );
}