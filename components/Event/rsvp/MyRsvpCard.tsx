// components/Event/rsvp/MyRsvpCard.tsx

import { prisma } from "@/lib/prisma";
import { MyRsvpCardClient } from "./MyRsvpCardClient";

interface MyRsvpCardProps {
  // eventId: number;
  eventSlug: string;
  userProfileId: number;
}

export async function MyRsvpCard({ 
  // eventId, 
  eventSlug, 
  userProfileId 
}: MyRsvpCardProps) {

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
  
  // Fetch user's RSVP for this event
  // const userRsvp = await prisma.rsvp.findFirst({
  //   where: {
  //     eventId: eventId,
  //     userProfileId: userProfileId
  //   }
  // });
  // above creates TS issue; replaced by below: 
  const userRsvp = await prisma.rsvp.findFirst({
    where: {
      // eventId: eventId,
      eventId: event.id,
      userProfileId: userProfileId
    },
    select: {
      id: true,
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