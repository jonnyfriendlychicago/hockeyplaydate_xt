// components/Event/rsvp/RsvpModal.tsx

'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { updateMyRsvpAction, updateMemberRsvpAction } from "@/app/(root)/event/[slug]/rsvpActions";
import { RSVP_ERROR_KEYS } from '@/lib/constants/errorKeys';
import { useRsvpAction } from '@/lib/hooks/useRsvpAction';
// import { RsvpStatus } from '@/lib/constants/rsvpEnums'; // no longer using this deprecated file
// import { RsvpStatus as PrismaRsvpStatus } from '@prisma/client'; // revisit why nec?
import { RsvpStatus } from '@prisma/client'; // revisit why nec?


interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventSlug: string;
  currentRsvp: { // devNote: this should be a type, like ChapterMemberWithProfile? 
    // rsvpStatus: string;
    // rsvpStatus: PrismaRsvpStatus | null; 
    rsvpStatus: RsvpStatus | null; 
    playersYouth: number | null; 
    playersAdult: number | null;
    spectatorsAdult: number | null;
    spectatorsYouth: number | null;
  } | null;
  isManagerMode: boolean; // For manager mode (Phase 4)
  targetUserName?: string; // For manager mode (Phase 4)
  targetUserProfileId?: number; // For manager mode (Phase 4)
}

export function RsvpModal({ 
  isOpen, 
  onClose, 
  eventSlug,
  currentRsvp,
  isManagerMode, // For manager mode (Phase 4)
  targetUserName, // For manager mode (Phase 4)
  targetUserProfileId
}: RsvpModalProps) {
  
  // Initialize form state with current values or defaults
  // const [selectedStatus, setSelectedStatus] = useState<string | null>(
  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus | null>(  // this line enforces the enum values from rsvpStatus! so, no longer plain string
    currentRsvp?.rsvpStatus || null
  );
  const [playersYouth, setPlayersYouth] = useState<string>(
    currentRsvp?.playersYouth?.toString() || '0'
  );
  const [playersAdult, setPlayersAdult] = useState<string>(
    currentRsvp?.playersAdult?.toString() || '0'
  );
  const [spectatorsAdult, setSpectatorsAdult] = useState<string>(
    currentRsvp?.spectatorsAdult?.toString() || '0'
  );
  const [spectatorsYouth, setSpectatorsYouth] = useState<string>(
    currentRsvp?.spectatorsYouth?.toString() || '0'
  );

  const { 
    executeAction, 
    isSubmitting 
  } = useRsvpAction({
    // errorKey: RSVP_ERROR_KEYS.UPDATE_MY_RSVP,
    // below replaces above: with introduction of other-member-rsvp-mgmt, we need conditional error key based on mode
    errorKey: isManagerMode ? RSVP_ERROR_KEYS.UPDATE_MEMBER_RSVP : RSVP_ERROR_KEYS.UPDATE_MY_RSVP,
    onSuccess: () => {
      // setSelectedStatus(null); 
      // devNote: line above not needed (in contrast to chapterMembership files) b/c 
      // (1) State re-initializes from props on every modal open
      // (2) Success triggers parent revalidation → props update → state auto-syncs
      // (3) You already have a proper reset in handleCancel() that uses props
      // Summary: The RSVP modal differs because it's an edit form (pre-populated from current values) 
      // while the chapter management modal is an action selector (starts blank each time).
      onClose();
    },
    onError: () => {
      // setSelectedStatus(null); 
      // devNote: line above not needed (in contrast to chapterMembership files).  explanation above.
      onClose();
    }
  });

  // Determine if counts should be shown
  const showCounts = selectedStatus === RsvpStatus.YES;

  // Handle status change - clear counts if not YES
  // const handleStatusChange = (status: string) => {
  const handleStatusChange = (status: RsvpStatus) => {
    setSelectedStatus(status);
    if (status !== RsvpStatus.YES) {
      // Clear all count fields when switching to MAYBE or NO
      setPlayersYouth('0');
      setPlayersAdult('0');
      setSpectatorsAdult('0');
      setSpectatorsYouth('0');
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus || isSubmitting) return;

    // // create new object ('countsToSubmit') to contain the count values, and also force counts to 0 if status is not YES; this forcing to zero happens on back end as well
    const countsToSubmit = selectedStatus === RsvpStatus.YES ? {
      playersYouth,
      playersAdult,
      spectatorsAdult,
      spectatorsYouth
    } : {
      playersYouth: '0',
      playersAdult: '0',
      spectatorsAdult: '0',
      spectatorsYouth: '0'
    };

    // // testing scenarios: replace above 'countsToSubmit' const with below.  all should result in Rsvp error 01
    // Test 0: ensure that this forcing of values is going thru; it does in dev! :-)
    // const countsToSubmit =  {
    //   playersYouth: '3',
    //   playersAdult: '3',
    //   spectatorsAdult: '3',
    //   spectatorsYouth: '3'
    // };
    // // Test 1: text instead of number
    // const countsToSubmit =  {
    //   playersYouth: 'hello',
    //   playersAdult: '0',
    //   spectatorsAdult: '0',
    //   spectatorsYouth: '0'
    // };

    // // Test 2: too big number
    // const countsToSubmit =  {
    //   playersYouth: '100000',
    //   playersAdult: '0',
    //   spectatorsAdult: '0',
    //   spectatorsYouth: '0'
    // };

    // // Test 3: negative number
    // const countsToSubmit =  {
    //   playersYouth: '-1',
    //   playersAdult: '0',
    //   spectatorsAdult: '0',
    //   spectatorsYouth: '0'
    // };

    // // Test 4: not an integer
    // const countsToSubmit =  {
    //   playersYouth: '1.5',
    //   playersAdult: '0',
    //   spectatorsAdult: '0',
    //   spectatorsYouth: '0'
    // };

    // await executeAction(updateMyRsvpAction, {
    //   eventSlug,
    //   rsvpStatus: selectedStatus,
    //   ...countsToSubmit
    // });

    // above replaced by below; above await function only works for updateMy...; below is conditional action call based on manager mode
    if (isManagerMode && targetUserProfileId) {
      // Manager updating another member's RSVP
      await executeAction(updateMemberRsvpAction, {
        eventSlug,
        targetUserProfileId: targetUserProfileId.toString(),
        rsvpStatus: selectedStatus,
        ...countsToSubmit
      });
    } else {
      // User updating their own RSVP
      await executeAction(updateMyRsvpAction, {
        eventSlug,
        rsvpStatus: selectedStatus,
        ...countsToSubmit
      });
    }

    // testing scenarios: replace above 'await..' function with below

    // // TEST #5: Invalid event slug - should result in Rsvp error 01 if has no value, and Rsvp error 02 if has nonexistent eventslug
    // await executeAction(updateMyRsvpAction, { 
    //   eventSlug: '',
    //   rsvpStatus: selectedStatus,
    // ...countsToSubmit
    // });

    // // TEST #6: Invalid RSVP status - should result in Rsvp error 01
    // await executeAction(updateMyRsvpAction, { 
    //   eventSlug,
    //   rsvpStatus: 'HACKED_STATUS',
    // ...countsToSubmit
    // });

  };

  const handleCancel = () => {
    // Reset form to original values
    setSelectedStatus(currentRsvp?.rsvpStatus || null);
    setPlayersYouth(currentRsvp?.playersYouth?.toString() || '0');
    setPlayersAdult(currentRsvp?.playersAdult?.toString() || '0');
    setSpectatorsAdult(currentRsvp?.spectatorsAdult?.toString() || '0');
    setSpectatorsYouth(currentRsvp?.spectatorsYouth?.toString() || '0');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isManagerMode ? `Update RSVP for ${targetUserName}` : 'Update Your RSVP'}
          </DialogTitle>
          <DialogDescription>
            {isManagerMode 
              ? `Update the RSVP and attendance counts for ${targetUserName}`
              : 'Update your RSVP status and attendance counts'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          
          {/* RSVP Status Selection */}
          <div>
            <Label className="text-sm font-medium">RSVP Status</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                type="button"
                variant={selectedStatus === RsvpStatus.YES ? "default" : "outline"}
                // onClick={() => setSelectedStatus(RsvpStatus.YES)}
                onClick={() => handleStatusChange(RsvpStatus.YES)}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs">Going</span>
              </Button>
              
              <Button
                type="button"
                variant={selectedStatus === RsvpStatus.MAYBE ? "default" : "outline"}
                // onClick={() => setSelectedStatus(RsvpStatus.MAYBE)}
                onClick={() => handleStatusChange(RsvpStatus.MAYBE)}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-xs">Maybe</span>
              </Button>
              
              <Button
                type="button"
                variant={selectedStatus === RsvpStatus.NO ? "default" : "outline"}
                // onClick={() => setSelectedStatus(RsvpStatus.NO)}
                onClick={() => handleStatusChange(RsvpStatus.NO)}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-xs">Can&apos;t Go</span>
              </Button>
            </div>
          </div>

          {/* Conditional: Show counts only for YES rsvps */}
          {showCounts && (
            <>
              {/* Player Counts */}
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">On-Ice Players</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="playersYouth" className="text-xs text-muted-foreground">
                      Youth Players
                    </Label>
                    <Input
                      id="playersYouth"
                      type="number"
                      min="0"
                      max="10"
                      value={playersYouth}
                      onChange={(e) => setPlayersYouth(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="playersAdult" className="text-xs text-muted-foreground">
                      Adult Players
                    </Label>
                    <Input
                      id="playersAdult"
                      type="number"
                      min="0"
                      max="10"
                      value={playersAdult}
                      onChange={(e) => setPlayersAdult(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Spectator Counts */}
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">Off-Ice Spectators</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="spectatorsYouth" className="text-xs text-muted-foreground">
                      Youth Spectators
                    </Label>
                    <Input
                      id="spectatorsYouth"
                      type="number"
                      min="0"
                      max="10"
                      value={spectatorsYouth}
                      onChange={(e) => setSpectatorsYouth(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="spectatorsAdult" className="text-xs text-muted-foreground">
                      Adult Spectators
                    </Label>
                    <Input
                      id="spectatorsAdult"
                      type="number"
                      min="0"
                      max="10"
                      value={spectatorsAdult}
                      onChange={(e) => setSpectatorsAdult(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </>
          ) 
          }

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedStatus || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save RSVP'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}