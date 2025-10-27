// components/chapter/LeaveChapterModal.tsx

'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leaveChapterAction } from "@/app/(root)/[slug]/actions";
import { CHAPTER_ERROR_KEYS } from '@/lib/constants/errorKeys';
// import { useChapterError } from '@/lib/hooks/useChapterError';
import { useChapterMembershipAction } from '@/lib/hooks/useChapterMembershipAction';

interface LeaveChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterSlug: string;
  chapterName: string;
}

export function LeaveChapterModal({ isOpen, onClose, chapterSlug, chapterName }: LeaveChapterModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.toLowerCase() === 'leave';
  
  // const [error, setError] = useState<string | null>(null);
  // CHANGED: Replace simple useState with sessionStorage-backed state
  // const [error, setError] = useState<string | null>(() => {
  //   if (typeof window !== 'undefined') {
  //     // const saved = sessionStorage.getItem('leaveChapterError');
  //     const saved = sessionStorage.getItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
  //     if (saved) {
  //       // sessionStorage.removeItem('leaveChapterError');
  //       sessionStorage.removeItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
  //       return saved;
  //     }
  //   }
  //   return null;
  // });

  // // ADDED: Helper function to persist error through remounts
  // const setErrorWithPersist = (value: string | null) => {
  //   setError(value);
  //   if (typeof window !== 'undefined') {
  //     if (value) {
  //       // sessionStorage.setItem('leaveChapterError', value);
  //       sessionStorage.setItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER, value);
  //     } else {
  //       // sessionStorage.removeItem('leaveChapterError');
  //       sessionStorage.removeItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
  //     }
  //   }
  // };
  
  // wow moment: all of above replaced with this one line, b/c of new utility design: 
  // const [error, setError] = useChapterError(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // and now, those two lines are replaced by below, in order to enable new streamlined submit/cancel function
  // Hook for leave chapter action
  const { 
    executeAction, 
    isSubmitting, 
    error, 
    clearError 
  } = useChapterMembershipAction({
    errorKey: CHAPTER_ERROR_KEYS.LEAVE_CHAPTER,
    onSuccess: () => {
      setConfirmText('');
      onClose();
    }
  });

  // const handleSubmit = async () => {
  //   // if (!isConfirmed) return;
  //   if (!isConfirmed || isSubmitting) return;
  //   setIsSubmitting(true);
  //   // setError(null);
  //   // setErrorWithPersist(null); 
  //   setError(null);
    
  //   try {
  //     const formData = new FormData();
  //     formData.append('chapterSlug', chapterSlug);
  //     // below for testing
  //     // console.log(chapterSlug)
  //     // const bogusChapterSlug = 'some-baloney!$'
  //     // formData.append('chapterSlug', bogusChapterSlug);
      
  //     // await leaveChapterAction(formData);
  //     const result = await leaveChapterAction(formData);

  //     if (result && !result.success) {
  //       // setError(result.error || 'Unable to leave chapter');
  //       // setErrorWithPersist(result.error || 'Unable to leave chapter');  // CHANGED: Use setError
  //       setError(result.error || 'Unable to leave chapter');
  //       setIsSubmitting(false);
  //       return;
  //     }
      
  //     // Reset and close
  //     setConfirmText('');
  //     onClose();
  //   } catch (error) {
  //     // Handle unexpected errors (redirects throw and that's ok)
  //       if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
  //         console.error('Leave chapter error:', error);
  //         // setError('Something went wrong. Please try again.');
  //         // setErrorWithPersist('Something went wrong. Please try again.');
  //         setError('Something went wrong. Please try again.');
  //         setIsSubmitting(false);
  //       }
  //   } 
  //   setIsSubmitting(false);
  // };

  const handleSubmit = async () => {
  if (!isConfirmed || isSubmitting) return;  
    await executeAction(leaveChapterAction, { chapterSlug });
    // below is for testing
    // console.log(chapterSlug); 
    // await executeAction(leaveChapterAction, { chapterSlug: 'BAD-SLUG' }); 
  };

  // const handleCancel = () => {
  //   setConfirmText('');
  //   // setError(null);
  //   // setErrorWithPersist(null); 
  //   setError(null);
  //   onClose();
  // };

  const handleCancel = () => {
    setConfirmText('');
    clearError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-800">Leave Chapter</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave {chapterName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <p className="text-sm text-muted-foreground">
            If you leave this chapter:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>You will lose access to chapter events and content</li>
            <li>You can reapply to join later</li>
            <li>Your request to rejoin will need manager approval</li>
          </ul>

          <div className="space-y-2">
            <Label htmlFor="confirmText">
              Type <span className="font-bold">leave</span> to confirm:
            </Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'leave' here"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleSubmit}
              // disabled={!isConfirmed}
              disabled={!isConfirmed || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {/* Leave Chapter */}
              {isSubmitting ? 'Leaving...' : 'Leave Chapter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}