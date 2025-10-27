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
// import { useChapterError } from '@/lib/hooks/useChapterError';
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
  chapterSlug // again, why now? 
}: ChapterMemberManagementModalProps) {
  
  
  
  // instead of the simple useState for error, use sessionStorage-backed version:
  // const [error, setError] = useState<string | null>(() => {
  //   if (typeof window !== 'undefined') {
  //     // const saved = sessionStorage.getItem('memberManagementError');
  //     const saved = sessionStorage.getItem(CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT);
  //     if (saved) {
  //       // sessionStorage.removeItem('memberManagementError');
  //       sessionStorage.removeItem(CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT);
  //       return saved;
  //     }
  //   }
  //   return null;
  // });
  
  // const [error, setError] = useChapterError(CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT);
  // const [selectedAction, setSelectedAction] = useState<string | null>(null);
  // const [isSubmitting, setIsSubmitting] = useState(false);  

  // and now, all of above is replaced with new hook program:
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { 
    executeAction, 
    isSubmitting, 
    error, 
    clearError 
  } = useChapterMembershipAction({
    errorKey: CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT,
    onSuccess: () => {
      setSelectedAction(null);
      onClose();
    }
  }); 

  if (!member) return null; // devNotes: This is a guard clause. Without this check, TypeScript would complain about every use of member.id, member.userProfile, etc. because it could be null 
  // devnotes: need to repeat above any time a prop or variable could be null or undefined and you need to use its properties.  This is called defensive programming and is a best practice

  const displayName = getDisplayName(member.userProfile.givenName, member.userProfile.familyName);
  const currentStatus = getMaskedRole(member.memberRole);
  const availableActions = getAvailableActions(member.memberRole);

  // helper function to persist error:
  // const setErrorWithPersist = (value: string | null) => {
  //   setError(value);
  //   if (typeof window !== 'undefined') {
  //     if (value) {
  //       // sessionStorage.setItem('memberManagementError', value);
  //       sessionStorage.setItem(CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT, value);
  //     } else {
  //       // sessionStorage.removeItem('memberManagementError');
  //       sessionStorage.removeItem(CHAPTER_ERROR_KEYS.MEMBER_MANAGEMENT);
  //     }
  //   }
  // };


  // const handleActionSelect = (action: string) => {
  //   setSelectedAction(action);
  //   // setErrorWithPersist(null)
  //   setError(null)
  // };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    clearError();
  };

  // const handleSubmit = async () => {
  //   if (!selectedAction || isSubmitting) return;  // ADD isSubmitting CHECK

  //   setIsSubmitting(true);  

  //   try {
  //     // call server action to update member role
  //     const formData = new FormData();
  //     formData.append('chapterSlug', chapterSlug);
  //     formData.append('chapterMemberId', member.id.toString());
  //     formData.append('newRole', selectedAction);
  //     // below for testing
  //     // formData.append('chapterSlug', chapterSlug);
  //     // formData.append('chapterMemberId', 'INVALID-ID');
  //     // formData.append('newRole', selectedAction);

  //     const result = await updateMemberRoleAction(formData);

  //     // check if action failed
  //     if (result && !result.success) {
  //       // setErrorWithPersist(result.error || 'Unable to update member role');
  //       setError(result.error || 'Unable to update member role');
  //       setSelectedAction(null);  // ADD THIS - clear selection on error
  //       setIsSubmitting(false);
  //       return;
  //     }
      
  //     // Reset and close only on success
  //     setSelectedAction(null);
  //     onClose();

  //   } catch (error) {
  //     if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
  //       console.error('Unexpected error:', error);
  //       // setErrorWithPersist('Something went wrong. Please try again.');
  //       setError('Something went wrong. Please try again.');
  //     }

  //   } finally {
  //     setIsSubmitting(false);  // this line always resets the loading state
  //   }
  // };

  const handleSubmit = async () => {
  if (!selectedAction || isSubmitting) return;

  await executeAction(updateMemberRoleAction, {
    // chapterSlug,
    // chapterMemberId: member.id.toString(),
    // newRole: selectedAction
  // below forced error for testing
    chapterSlug,
    chapterMemberId: 'INVALID-ID',
    newRole: selectedAction
  });
};

  // const handleCancel = () => {
  //   setSelectedAction(null);
  //   // setErrorWithPersist(null)
  //   setError(null)
  //   onClose();
  // };

  const handleCancel = () => {
    setSelectedAction(null);
    clearError();
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


