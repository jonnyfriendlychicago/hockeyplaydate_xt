// components/Event/rsvp/MyRsvpCardClient.tsx

'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle, AlertTriangle, Edit } from "lucide-react";
import { RsvpModal } from "./RsvpModal";
import { RSVP_ERROR_KEYS } from '@/lib/constants/errorKeys';
import { useRsvpError } from '@/lib/hooks/useRsvpError';
import { RsvpStatus } from '@/lib/constants/rsvpEnums';
import { RsvpStatus as PrismaRsvpStatus } from '@prisma/client';

interface MyRsvpCardClientProps {
  userRsvp: {
    id: number;
    rsvpStatus: PrismaRsvpStatus | null;
    playersYouth: number | null;
    playersAdult: number | null;
    spectatorsAdult: number | null;
    spectatorsYouth: number | null;
  } | null;
  eventSlug: string;
}

function getStatusConfig(status: PrismaRsvpStatus | null) {
  switch (status) {
    case RsvpStatus.YES:
      return {
        label: 'IN!',
        icon: CheckCircle,
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        borderColor: 'border-green-600',
      };
    case RsvpStatus.NO:
      return {
        label: 'Out',
        icon: XCircle,
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        borderColor: 'border-red-600',
      };
    case RsvpStatus.MAYBE:
      return {
        label: 'Maybe(?)',
        icon: HelpCircle,
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        borderColor: 'border-yellow-500',
      };
    default:
      return {
        label: 'XYZ',
        icon: HelpCircle,
        bgColor: 'bg-blue-600',
        textColor: 'text-white',
        borderColor: 'border-blue-600',
      };
  }
}

export function MyRsvpCardClient({ userRsvp, eventSlug }: MyRsvpCardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useRsvpError(RSVP_ERROR_KEYS.UPDATE_MY_RSVP);

  const openModal = () => {
    setModalError(null);
    setIsModalOpen(true);
  };

  const currentStatus = userRsvp?.rsvpStatus || null;
  const statusConfig = getStatusConfig(currentStatus);
  const StatusIcon = statusConfig.icon;
  
  // Check for "0 players" warning when status is YES
  const showPlayerWarning = 
    userRsvp?.rsvpStatus === RsvpStatus.YES &&
    (userRsvp.playersYouth || 0) === 0 &&
    (userRsvp.playersAdult || 0) === 0;

  // // Compact mode: No RSVP or player warning
  // const isCompact = !userRsvp || showPlayerWarning;

  // Only show counts for YES status
  const showCounts = userRsvp?.rsvpStatus === RsvpStatus.YES;

  // Determine which counts are > 0
  const hasYouthPlayers = (userRsvp?.playersYouth || 0) > 0;
  const hasAdultPlayers = (userRsvp?.playersAdult || 0) > 0;
  const hasAdultSpectators = (userRsvp?.spectatorsAdult || 0) > 0;
  const hasYouthSpectators = (userRsvp?.spectatorsYouth || 0) > 0;
  const hasAnySpectators = hasAdultSpectators || hasYouthSpectators;

  return (
    <>
      <Card className={`border-2 ${statusConfig.borderColor} shadow-lg`}>
        <CardContent className="p-0">
          
          {/* Display modal error if exists */}
          {modalError && (
            <div className="p-4 bg-red-50 border-b-2 border-red-200">
              <p className="text-red-800 text-sm font-medium">{modalError}</p>
            </div>
          )}

          <div className={`${statusConfig.bgColor} ${statusConfig.textColor} p-4`}>
            <div className="flex items-center justify-between">
              {/* Left: Status with Icon */}
              <div className="flex items-center gap-3">
                <StatusIcon className="w-8 h-8" />
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-90">Your RSVP:</p>
                  <p className="text-2xl font-bold">{statusConfig.label}</p>
                </div>
              </div>

              {/* Right: Action Button */}
              <Button 
                onClick={openModal}
                variant="secondary"
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold shadow-md"
              >
                <Edit className="w-4 h-4 mr-2" />
                {userRsvp ? 'Update' : 'Add RSVP'}
              </Button>
            </div>
          </div>

          {/* Expanded Section: Player Counts (only if RSVP exists and no warning) */}
          {/* {userRsvp && !isCompact && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{userRsvp.playersYouth || 0}</p>
                  <p className="text-xs text-muted-foreground">Youth Players</p>
                </div>
                
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{userRsvp.playersAdult || 0}</p>
                  <p className="text-xs text-muted-foreground">Adult Players</p>
                </div>
                
                
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-600">{userRsvp.spectatorsAdult || 0}</p>
                  <p className="text-xs text-muted-foreground">Adult Spectators</p>
                </div>
                
               
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-600">{userRsvp.spectatorsYouth || 0}</p>
                  <p className="text-xs text-muted-foreground">Youth Spectators</p>
                </div>
              </div>
            </div>
          )} */}

          {/* Expanded Section: Player Counts (only if YES status and has counts) */}
          {showCounts && !showPlayerWarning && (hasYouthPlayers || hasAdultPlayers || hasAnySpectators) && (
            <div className="p-4 bg-gray-50 border-t">
              {/* Players Row - only show non-zero values */}
              {(hasYouthPlayers || hasAdultPlayers) && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {hasYouthPlayers && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{userRsvp.playersYouth}</p>
                      <p className="text-xs text-muted-foreground">Youth Players</p>
                    </div>
                  )}
                  
                  {hasAdultPlayers && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{userRsvp.playersAdult}</p>
                      <p className="text-xs text-muted-foreground">Adult Players</p>
                    </div>
                  )}
                </div>
              )}

              {/* Spectators Row - only show if any spectators exist */}
              {hasAnySpectators && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {hasAdultSpectators && (
                    <div className="text-center">
                      <p className="text-xl font-semibold text-gray-600">{userRsvp.spectatorsAdult}</p>
                      <p className="text-xs text-muted-foreground">Adult Spectators</p>
                    </div>
                  )}
                  
                  {hasYouthSpectators && (
                    <div className="text-center">
                      <p className="text-xl font-semibold text-gray-600">{userRsvp.spectatorsYouth}</p>
                      <p className="text-xs text-muted-foreground">Youth Spectators</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Player Warning Banner */}
          {showPlayerWarning && (
            <div className="p-4 bg-amber-50 border-t-2 border-amber-400">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 text-sm">Notice: No players indicated</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Your RSVP shows no on-ice players. If correct, no action needed. Otherwise, please update your RSVP to reflect counts.
                  </p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <RsvpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventSlug={eventSlug}
        currentRsvp={userRsvp}
        isManagerMode={false}
      />
    </>
  );
}


// below = initial draft , replaced by above

// 'use client';

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
// import { RsvpModal } from "./RsvpModal";
// import { RSVP_ERROR_KEYS } from '@/lib/constants/errorKeys';
// import { useRsvpError } from '@/lib/hooks/useRsvpError';
// import { RsvpStatus } from '@/lib/constants/rsvpEnums';
// import { RsvpStatus as PrismaRsvpStatus } from '@prisma/client'; 

// interface MyRsvpCardClientProps {
//   userRsvp: {
//     id: number;
//     // rsvpStatus: string;
//     rsvpStatus: PrismaRsvpStatus | null; 
//     playersYouth: number | null;
//     playersAdult: number | null;
//     spectatorsAdult: number | null;
//     spectatorsYouth: number | null;
//   } | null;
//   eventSlug: string;
// }

// function getRsvpIcon(status: string | null) {
//   switch (status) {
//     case RsvpStatus.YES:
//       return <CheckCircle className="w-4 h-4 text-green-600" />;
//     case RsvpStatus.NO:
//       return <XCircle className="w-4 h-4 text-red-600" />;
//     case RsvpStatus.MAYBE:
//       return <HelpCircle className="w-4 h-4 text-yellow-600" />;
//     default:
//       return <HelpCircle className="w-4 h-4 text-gray-400" />;
//   }
// }

// function getRsvpLabel(status: string | null) {
//   switch (status) {
//     case RsvpStatus.YES:
//       return 'Going';
//     case RsvpStatus.NO:
//       return "Can't Go";
//     case RsvpStatus.MAYBE:
//       return 'Maybe';
//     default:
//       return 'No Reply';
//   }
// }

// function getRsvpBadgeVariant(status: string | null) {
//   switch (status) {
//     case RsvpStatus.YES:
//       return 'default'; // Green
//     case RsvpStatus.NO:
//       return 'destructive'; // Red
//     case RsvpStatus.MAYBE:
//       return 'secondary'; // Yellow/Gray
//     default:
//       return 'outline'; // Gray outline
//   }
// }

// export function MyRsvpCardClient({ userRsvp, eventSlug }: MyRsvpCardClientProps) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalError, setModalError] = useRsvpError(RSVP_ERROR_KEYS.UPDATE_MY_RSVP);

//   const openModal = () => {
//     setModalError(null);
//     setIsModalOpen(true);
//   };

//   const currentStatus = userRsvp?.rsvpStatus || null;
//   const statusLabel = getRsvpLabel(currentStatus);
  
//   // Check for "0 players" warning when status is YES
//   const showPlayerWarning = 
//     userRsvp?.rsvpStatus === RsvpStatus.YES &&
//     (userRsvp.playersYouth || 0) === 0 &&
//     (userRsvp.playersAdult || 0) === 0;

//   return (
//     <>
//       <Card className="border-0 shadow-none">
//         <CardHeader>
//           <CardTitle>My RSVP</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
          
//           {/* Display modal error if exists */}
//           {modalError && (
//             <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-red-800 text-sm">{modalError}</p>
//             </div>
//           )}

//           {/* Current Status */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               {getRsvpIcon(currentStatus)}
//               <span className="text-sm font-medium text-muted-foreground">Status:</span>
//             </div>
//             <Badge variant={getRsvpBadgeVariant(currentStatus)}>
//               {statusLabel}
//             </Badge>
//           </div>

//           {/* Player Counts - only show if RSVP exists */}
//           {userRsvp && (
//             <div className="space-y-2 pt-2 border-t">
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-muted-foreground">Youth Players:</span>
//                 <span className="font-medium">{userRsvp.playersYouth || 0}</span>
//               </div>
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-muted-foreground">Adult Players:</span>
//                 <span className="font-medium">{userRsvp.playersAdult || 0}</span>
//               </div>
              
//               {/* Spectators - subtle/collapsed by default */}
//               {((userRsvp.spectatorsAdult || 0) > 0 || (userRsvp.spectatorsYouth || 0) > 0) && (
//                 <details className="text-sm">
//                   <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
//                     Spectators ({(userRsvp.spectatorsAdult || 0) + (userRsvp.spectatorsYouth || 0)})
//                   </summary>
//                   <div className="ml-4 mt-2 space-y-1">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Adults:</span>
//                       <span>{userRsvp.spectatorsAdult || 0}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Youth:</span>
//                       <span>{userRsvp.spectatorsYouth || 0}</span>
//                     </div>
//                   </div>
//                 </details>
//               )}
//             </div>
//           )}

//           {/* Player Warning - soft alert */}
//           {showPlayerWarning && (
//             <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
//               <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
//               <div className="text-sm text-amber-800">
//                 <p className="font-medium">Notice: No players indicated</p>
//                 <p className="text-xs mt-1">
//                   Your RSVP shows no on-ice players. If this is correct, no action needed. 
//                   Otherwise, please update your player counts.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Update Button */}
//           <Button 
//             onClick={openModal}
//             className="w-full"
//             variant={userRsvp ? "outline" : "default"}
//           >
//             {userRsvp ? 'Update RSVP' : 'Add RSVP'}
//           </Button>

//         </CardContent>
//       </Card>

//       <RsvpModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         eventSlug={eventSlug}
//         currentRsvp={userRsvp}
//         isManagerMode={false}
//       />
//     </>
//   );
// }