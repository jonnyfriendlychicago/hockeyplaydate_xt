// components/Event/rsvp/RsvpSummary.tsx

import { prisma } from "@/lib/prisma";
import { RsvpSummaryClient } from "./RsvpSummaryClient";
import { RsvpStatus } from '@/lib/constants/rsvpEnums';

interface RsvpSummaryProps {
  eventId: number;
}

export async function RsvpSummary({ eventId }: RsvpSummaryProps) {
  
  // Fetch all RSVPs for this event
  const rsvps = await prisma.rsvp.findMany({
    where: {
      eventId: eventId,
    },
    select: {
      rsvpStatus: true,
      playersYouth: true,
      playersAdult: true,
      spectatorsAdult: true,
      spectatorsYouth: true,
    }
  });

  // Calculate counts - ONLY from YES responses
  let youthPlayers = 0;
  let adultPlayers = 0;
  let adultSpectators = 0;
  let youthSpectators = 0;
  let maybeCount = 0;

  rsvps.forEach((rsvp) => {
    if (rsvp.rsvpStatus === RsvpStatus.YES) {
      youthPlayers += rsvp.playersYouth || 0;
      adultPlayers += rsvp.playersAdult || 0;
      adultSpectators += rsvp.spectatorsAdult || 0;
      youthSpectators += rsvp.spectatorsYouth || 0;
    } else if (rsvp.rsvpStatus === RsvpStatus.MAYBE) {
      maybeCount += 1;
    }
  });

  return (
    <RsvpSummaryClient 
      youthPlayers={youthPlayers}
      adultPlayers={adultPlayers}
      adultSpectators={adultSpectators}
      youthSpectators={youthSpectators}
      maybeCount={maybeCount}
    />
  );
}