// components/chapter/LeaveChapterModal.tsx

'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leaveChapterAction } from "@/app/(root)/[slug]/actions";

interface LeaveChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterSlug: string;
  chapterName: string;
}

export function LeaveChapterModal({ isOpen, onClose, chapterSlug, chapterName }: LeaveChapterModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.toLowerCase() === 'leave';

  const handleSubmit = async () => {
    if (!isConfirmed) return;
    
    const formData = new FormData();
    formData.append('chapterSlug', chapterSlug);
    
    await leaveChapterAction(formData);
    
    // Reset and close
    setConfirmText('');
    onClose();
  };

  const handleCancel = () => {
    setConfirmText('');
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
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleSubmit}
              disabled={!isConfirmed}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave Chapter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}