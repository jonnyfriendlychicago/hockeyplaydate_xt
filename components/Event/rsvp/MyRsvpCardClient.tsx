// components/Event/rsvp/MyRsvpCardClient.tsx

'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle, AlertTriangle, Edit } from "lucide-react";
import { RsvpModal } from "./RsvpModal";
// import { RSVP_ERROR_KEYS } from '@/lib/constants/errorKeys';
// import { useRsvpError } from '@/lib/hooks/useRsvpError';
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
        label: 'gimmieRSVP',
        icon: HelpCircle,
        bgColor: 'bg-gray-400',
        textColor: 'text-white',
        borderColor: 'border-gray-400',
      };
  }
}

export function MyRsvpCardClient({ 
  eventSlug , 
  userRsvp, 
}: MyRsvpCardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalError, setModalError] = useRsvpError(RSVP_ERROR_KEYS.UPDATE_MY_RSVP);

  const openModal = () => {
    // setModalError(null);
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
          {/* {modalError && (
            <div className="p-4 bg-red-50 border-b-2 border-red-200">
              <p className="text-red-800 text-sm font-medium">{modalError}</p>
            </div>
          )} */}

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
                aria-label={userRsvp ? 'Update your RSVP' : 'Add your RSVP'} 
              >
                <Edit className="w-4 h-4 mr-2" />
                {userRsvp ? 'Update' : 'Add RSVP'}
              </Button>
            </div>
          </div>

          {/* Expanded Section: Player Counts (only if YES status and has counts) */}
          {showCounts && !showPlayerWarning && (hasYouthPlayers || hasAdultPlayers || hasAnySpectators) && (
            <div className="p-4 bg-gray-50 ">
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
                <div className="grid grid-cols-2 gap-4 pt-4 ">
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
        isManagerMode={false} // For manager mode (Phase 4)
      />
    </>
  );
}