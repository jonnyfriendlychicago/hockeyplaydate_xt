// components/chapter/ChapterMemberManagementModal.tsx

// 2025oct01: 
// strongly feel like we want to enhance this modal to be situationally specific.  For example, 
// if current memberRole = applicant, then options should be masked as "approve" (for set to member) or "ignore" (set to remove) or "block" (basically leave as is), 
// and should not show options for setting to manager.  that's just setting up the reviewer for errors, i.e., moving applicant to manager instead of applicant to member.
// similarly, set to manager should only appear if current status = member; we don't want a user accidentally going from removed or BLOCKED to manager; major security hole.  
// initial sketch: 

// current role | options: 
// applicant | member "approve"; removed "ignore"; blocked "block"; 
// member | manager ("promote to manager"); removed "remove from group"; blocked "block"
// blocked | member ("unblock and make member"); removed ("unblock - do not make member"); DO NOT show manager option.
// removed | block; member ("set as member")
// now if currently manager,  wait, problem: can't enable a manager fight.  One member needs to be designated as owner; only owner can demote/remove/block a manager or make someone else the owner. 
// so, if not owner, do not allow edits to someone who is currently a manager.  IF owner, do below:
// manager | member ("demote to member"); removed "ignore"; blocked "block"; 
// also about above: future state, will need a method for owners to set someone else as owner, thus allowing them to retire.  make that tab called "chapter admin"?  make email funtion for now? 

'use client';

import { useState } from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChapterMemberWithProfile, getMaskedRole, getDisplayName} from "@/lib/types/chapterMember";
import { updateMemberRoleAction } from "@/app/(root)/[slug]/actions";
import { CHAPTER_ERROR_KEYS } from '@/lib/constants/errorKeys';
import { useChapterMembershipAction } from '@/lib/hooks/useChapterMembershipAction';

interface ChapterMemberManagementModalProps {
  member: ChapterMemberWithProfile | null;
  isOpen: boolean;
  onClose: () => void;
  chapterSlug: string; 
}

function getAvailableActions(currentRole: string): string[] {
  const allRoles = ['MEMBER', 'MANAGER', 'BLOCKED', 'REMOVED']; // Don't show current role or APPLICANT (can't go back to applicant)
  return allRoles.filter(role => role !== currentRole);
}

export function ChapterMemberManagementModal({ 
  member, 
  isOpen, 
  onClose, 
  chapterSlug 
}: ChapterMemberManagementModalProps) {
  
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { 
    executeAction, 
    isSubmitting, 
  } = useChapterMembershipAction({
    errorKey: CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT,
    onSuccess: () => {
      setSelectedAction(null);
      onClose();
    }, 
    onError: () => {  
      setSelectedAction(null);
      onClose();
    }
  }); 

  if (!member) return null; // devNotes: This is a guard clause. Without this check, TypeScript would complain about every use of member.id, member.userProfile, etc. because it could be null 
  // devnotes: need to repeat above any time a prop or variable could be null or undefined and you need to use its properties.  This is called defensive programming and is a best practice

  const displayName = getDisplayName(member.userProfile.givenName, member.userProfile.familyName);
  const currentStatus = getMaskedRole(member.memberRole);
  const availableActions = getAvailableActions(member.memberRole);

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
  };

  const handleSubmit = async () => {
    if (!selectedAction || isSubmitting) return;

    await executeAction(updateMemberRoleAction, {
      chapterSlug,
      chapterMemberId: member.id.toString(),
      newRole: selectedAction
      // below forced error for testing
        // chapterSlug,
        // chapterMemberId: 'INVALID-ID',
        // newRole: selectedAction
      });
  };

  const handleCancel = () => {
    setSelectedAction(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Member</DialogTitle>
          <DialogDescription>
            Update the status for {displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Status:</label>
            <div className="mt-1">
              <Badge variant="secondary">{currentStatus}</Badge>
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">New Status:</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {availableActions.map((action) => (
                <Button
                  key={action}
                  variant={selectedAction === action ? "default" : "outline"}
                  onClick={() => handleActionSelect(action)}
                  className="justify-start"
                  disabled={isSubmitting}
                >
                  {getMaskedRole(action)}
                </Button>
              ))}
            </div>
          </div>

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
              disabled={!selectedAction || isSubmitting}      
            >
              {/* Update Status */}
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


