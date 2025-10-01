// components/chapter/ChapterMemberManagementModal.tsx

'use client';

import { useState } from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChapterMemberWithProfile, getMaskedRole, getDisplayName} from "@/lib/types/chapterMember";

// interface ChapterMember {
//   id: number;
//   chapterId: number;
//   userProfileId: number;
//   memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
//   joinedAt: Date;
//   userProfile: {
//     id: number;
//     givenName: string | null;
//     familyName: string | null;
//     authUser: {
//       picture: string | null;
//     } | null;
//   };
// }

interface ChapterMemberManagementModalProps {
  // member: ChapterMember | null;
  member: ChapterMemberWithProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

// function getMaskedRole(role: string): string {
//   switch (role) {
//     case 'APPLICANT': return 'Applicant';
//     case 'MEMBER': return 'Member';
//     case 'MANAGER': return 'Manager';
//     case 'BLOCKED': return 'Blocked';
//     case 'REMOVED': return 'Removed';
//     default: return role;
//   }
// }

// function getDisplayName(givenName: string | null, familyName: string | null): string {
//   const first = givenName || '';
//   const last = familyName || '';
//   return `${first} ${last}`.trim() || 'Unknown User';
// }

function getAvailableActions(currentRole: string): string[] {
  const allRoles = ['MEMBER', 'MANAGER', 'BLOCKED', 'REMOVED'];
  // Don't show current role or APPLICANT (can't go back to applicant)
  return allRoles.filter(role => role !== currentRole);
}

export function ChapterMemberManagementModal({ member, isOpen, onClose }: ChapterMemberManagementModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!member) return null;

  const displayName = getDisplayName(member.userProfile.givenName, member.userProfile.familyName);
  const currentStatus = getMaskedRole(member.memberRole);
  const availableActions = getAvailableActions(member.memberRole);

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
  };

  const handleSubmit = () => {
    if (!selectedAction) return;
    
    // TODO: Call server action to update member role
    console.log(`Updating ${member.id} to role: ${selectedAction}`);
    
    // Reset and close
    setSelectedAction(null);
    onClose();
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
                >
                  {getMaskedRole(action)}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedAction}
            >
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


