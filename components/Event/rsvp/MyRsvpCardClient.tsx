// components/Event/rsvp/MyRsvpCardClient.tsx

'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import { RsvpModal } from "./RsvpModal";
import { RSVP_ERROR_KEYS } from '@/lib/constants/errorKeys';
import { useRsvpError } from '@/lib/hooks/useRsvpError';
import { RsvpStatus } from '@/lib/constants/rsvpEnums';
import { RsvpStatus as PrismaRsvpStatus } from '@prisma/client'; 

interface MyRsvpCardClientProps {
  userRsvp: {
    id: number;
    // rsvpStatus: string;
    rsvpStatus: PrismaRsvpStatus | null; 
    playersYouth: number | null;
    playersAdult: number | null;
    spectatorsAdult: number | null;
    spectatorsYouth: number | null;
  } | null;
  eventSlug: string;
}

function getRsvpIcon(status: string | null) {
  switch (status) {
    case RsvpStatus.YES:
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case RsvpStatus.NO:
      return <XCircle className="w-4 h-4 text-red-600" />;
    case RsvpStatus.MAYBE:
      return <HelpCircle className="w-4 h-4 text-yellow-600" />;
    default:
      return <HelpCircle className="w-4 h-4 text-gray-400" />;
  }
}

function getRsvpLabel(status: string | null) {
  switch (status) {
    case RsvpStatus.YES:
      return 'Going';
    case RsvpStatus.NO:
      return "Can't Go";
    case RsvpStatus.MAYBE:
      return 'Maybe';
    default:
      return 'No Reply';
  }
}

function getRsvpBadgeVariant(status: string | null) {
  switch (status) {
    case RsvpStatus.YES:
      return 'default'; // Green
    case RsvpStatus.NO:
      return 'destructive'; // Red
    case RsvpStatus.MAYBE:
      return 'secondary'; // Yellow/Gray
    default:
      return 'outline'; // Gray outline
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
  const statusLabel = getRsvpLabel(currentStatus);
  
  // Check for "0 players" warning when status is YES
  const showPlayerWarning = 
    userRsvp?.rsvpStatus === RsvpStatus.YES &&
    (userRsvp.playersYouth || 0) === 0 &&
    (userRsvp.playersAdult || 0) === 0;

  return (
    <>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>My RSVP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Display modal error if exists */}
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{modalError}</p>
            </div>
          )}

          {/* Current Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRsvpIcon(currentStatus)}
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
            </div>
            <Badge variant={getRsvpBadgeVariant(currentStatus)}>
              {statusLabel}
            </Badge>
          </div>

          {/* Player Counts - only show if RSVP exists */}
          {userRsvp && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Youth Players:</span>
                <span className="font-medium">{userRsvp.playersYouth || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Adult Players:</span>
                <span className="font-medium">{userRsvp.playersAdult || 0}</span>
              </div>
              
              {/* Spectators - subtle/collapsed by default */}
              {((userRsvp.spectatorsAdult || 0) > 0 || (userRsvp.spectatorsYouth || 0) > 0) && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Spectators ({(userRsvp.spectatorsAdult || 0) + (userRsvp.spectatorsYouth || 0)})
                  </summary>
                  <div className="ml-4 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adults:</span>
                      <span>{userRsvp.spectatorsAdult || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Youth:</span>
                      <span>{userRsvp.spectatorsYouth || 0}</span>
                    </div>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Player Warning - soft alert */}
          {showPlayerWarning && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Notice: No players indicated</p>
                <p className="text-xs mt-1">
                  Your RSVP shows no on-ice players. If this is correct, no action needed. 
                  Otherwise, please update your player counts.
                </p>
              </div>
            </div>
          )}

          {/* Update Button */}
          <Button 
            onClick={openModal}
            className="w-full"
            variant={userRsvp ? "outline" : "default"}
          >
            {userRsvp ? 'Update RSVP' : 'Add RSVP'}
          </Button>

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