// components/Event/rsvp/MyRsvpCard.tsx

import { prisma } from "@/lib/prisma";
import { MyRsvpCardClient } from "./MyRsvpCardClient";

interface MyRsvpCardProps {
  eventId: number;
  eventSlug: string;
  userProfileId: number;
}

export async function MyRsvpCard({ 
  eventId, 
  eventSlug, 
  userProfileId 
}: MyRsvpCardProps) {
  
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
      eventId: eventId,
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