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
  chapterSlug // again, why now? 
}: ChapterMemberManagementModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);  
  // const [error, setError] = useState<string | null>(null);
  // Replace the simple useState for error with sessionStorage-backed version:
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('memberManagementError');
      if (saved) {
        sessionStorage.removeItem('memberManagementError');
        return saved;
      }
    }
    return null;
  });

  if (!member) return null;

  const displayName = getDisplayName(member.userProfile.givenName, member.userProfile.familyName);
  const currentStatus = getMaskedRole(member.memberRole);
  const availableActions = getAvailableActions(member.memberRole);

  // helper function to persist error:
  const setErrorWithPersist = (value: string | null) => {
    setError(value);
    if (typeof window !== 'undefined') {
      if (value) {
        sessionStorage.setItem('memberManagementError', value);
      } else {
        sessionStorage.removeItem('memberManagementError');
      }
    }
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    // setError(null);  // Clear any previous errors
    setErrorWithPersist(null)
  };

  const handleSubmit = async () => {
    // if (!selectedAction) return;
    if (!selectedAction || isSubmitting) return;  // ADD isSubmitting CHECK

    setIsSubmitting(true);  

    try {
      // call server action to update member role
      const formData = new FormData();
      formData.append('chapterSlug', chapterSlug);
      formData.append('chapterMemberId', member.id.toString());
      formData.append('newRole', selectedAction);
      // below for testing
      // formData.append('chapterSlug', chapterSlug);
      // formData.append('chapterMemberId', 'INVALID-ID');
      // formData.append('newRole', selectedAction);

      const result = await updateMemberRoleAction(formData);

      // check if action failed
      if (result && !result.success) {
        // Handle error - show toast or error message
        // console.error('Failed to update role:', result.error);
        // Don't close modal on error
        // setError(result.error || 'Unable to update member role');
        setErrorWithPersist(result.error || 'Unable to update member role');
        setSelectedAction(null);  // ADD THIS - clear selection on error
        setIsSubmitting(false);
        return;
      }
      
      // Reset and close only on success
      setSelectedAction(null);
      onClose();

    } catch (error) {
      // Handle unexpected errors
      // console.error('Unexpected error:', error);
      // above replaced by below
      // Handle unexpected errors (redirect throws are expected)
      if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
        console.error('Unexpected error:', error);
        // setError('Something went wrong. Please try again.');
        setErrorWithPersist('Something went wrong. Please try again.');
      }

    } finally {
      setIsSubmitting(false);  // this line always resets the loading state
    }
  };

  const handleCancel = () => {
    setSelectedAction(null);
    // setError(null);  // Clear any errors
    setErrorWithPersist(null)
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

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

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
              // disabled={!selectedAction}
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


