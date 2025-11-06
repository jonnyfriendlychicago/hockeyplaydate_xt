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

// above remodel replaces below

// export async function RsvpSummary({ eventId }: RsvpSummaryProps) {
  
//   // Fetch all RSVPs for this event (excluding NO responses)
//   const rsvps = await prisma.rsvp.findMany({
//     where: {
//       eventId: eventId,
//       rsvpStatus: {
//         in: [RsvpStatus.YES, RsvpStatus.MAYBE]
//       }
//     },
//     select: {
//       rsvpStatus: true,
//       playersYouth: true,
//       playersAdult: true,
//       spectatorsAdult: true,
//       spectatorsYouth: true,
//     }
//   });

//   // Calculate aggregated counts
//   let youthPlayersYes = 0;
//   let youthPlayersMaybe = 0;
//   let adultPlayersYes = 0;
//   let adultPlayersMaybe = 0;
//   let adultSpectatorsYes = 0;
//   let adultSpectatorsMaybe = 0;
//   let youthSpectatorsYes = 0;
//   let youthSpectatorsMaybe = 0;

//   rsvps.forEach((rsvp) => {
//     const isYes = rsvp.rsvpStatus === RsvpStatus.YES;
//     const isMaybe = rsvp.rsvpStatus === RsvpStatus.MAYBE;

//     if (isYes) {
//       youthPlayersYes += rsvp.playersYouth || 0;
//       adultPlayersYes += rsvp.playersAdult || 0;
//       adultSpectatorsYes += rsvp.spectatorsAdult || 0;
//       youthSpectatorsYes += rsvp.spectatorsYouth || 0;
//     } else if (isMaybe) {
//       youthPlayersMaybe += rsvp.playersYouth || 0;
//       adultPlayersMaybe += rsvp.playersAdult || 0;
//       adultSpectatorsMaybe += rsvp.spectatorsAdult || 0;
//       youthSpectatorsMaybe += rsvp.spectatorsYouth || 0;
//     }
//   });

//   // Calculate totals
//   const youthPlayersTotal = youthPlayersYes + youthPlayersMaybe;
//   const adultPlayersTotal = adultPlayersYes + adultPlayersMaybe;
//   const adultSpectatorsTotal = adultSpectatorsYes + adultSpectatorsMaybe;
//   const youthSpectatorsTotal = youthSpectatorsYes + youthSpectatorsMaybe;
  
//   const totalHumansYes = youthPlayersYes + adultPlayersYes + adultSpectatorsYes + youthSpectatorsYes;
//   const totalHumansMaybe = youthPlayersMaybe + adultPlayersMaybe + adultSpectatorsMaybe + youthSpectatorsMaybe;
//   const totalHumansTotal = totalHumansYes + totalHumansMaybe;

//   return (
//     <RsvpSummaryClient 
//       players={{
//         youth: {
//           yes: youthPlayersYes,
//           maybe: youthPlayersMaybe,
//           total: youthPlayersTotal
//         },
//         adult: {
//           yes: adultPlayersYes,
//           maybe: adultPlayersMaybe,
//           total: adultPlayersTotal
//         }
//       }}
//       spectators={{
//         adult: {
//           yes: adultSpectatorsYes,
//           maybe: adultSpectatorsMaybe,
//           total: adultSpectatorsTotal
//         },
//         youth: {
//           yes: youthSpectatorsYes,
//           maybe: youthSpectatorsMaybe,
//           total: youthSpectatorsTotal
//         }
//       }}
//       totalHumans={{
//         yes: totalHumansYes,
//         maybe: totalHumansMaybe,
//         total: totalHumansTotal
//       }}
//     />
//   );
// }