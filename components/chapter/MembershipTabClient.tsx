// components/chapter/MembershipTabClient.tsx

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMaskedRole } from "@/lib/types/chapterMember";
import { format } from "date-fns";
import { LeaveChapterModal } from "./LeaveChapterModal";
// import { useEffect } from 'react';
import { CHAPTER_ERROR_KEYS } from '@/lib/constants/errorKeys'; 

interface MembershipTabClientProps {
  membership: {
    id: number;
    memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
    joinedAt: Date;
  };
  isSoleManager: boolean;
  chapterSlug: string;
  chapterName: string;
}

export function MembershipTabClient({ membership, isSoleManager, chapterSlug, chapterName }: MembershipTabClientProps) {

  // Inside the component:
  // useEffect(() => {
  //   console.log('MembershipTabClient mounted');
  //   return () => {
  //     console.log('MembershipTabClient UNMOUNTING!');
  //   };
  // }, []);
  
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Check for persisted error on mount
  const [modalError, setModalError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      // const saved = sessionStorage.getItem('leaveChapterError');
      const saved = sessionStorage.getItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
      if (saved) {
        // sessionStorage.removeItem('leaveChapterError');
        sessionStorage.removeItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
        return saved;
      }
    }
    return null;
  });

  // Clear error when opening modal
  const openModal = () => {
    setModalError(null);
    if (typeof window !== 'undefined') {
      // sessionStorage.removeItem('leaveChapterError');
      sessionStorage.removeItem(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER); 
    }
    setIsLeaveModalOpen(true);
  };

  // // Add debugging
  // const closeModal = () => {
  //   console.log('Modal close called - stack trace:', new Error().stack);
  //   setIsLeaveModalOpen(false);
  // };

  return (
    <div className="space-y-6">
      {/* Membership Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Membership</CardTitle>
          <CardDescription>Information about your chapter membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Role:</span>
            <div className="mt-1">
              <Badge variant="secondary">{getMaskedRole(membership.memberRole)}</Badge>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Joined:</span>
            <p className="mt-1">{format(membership.joinedAt, 'MMMM d, yyyy')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>

          {modalError && (
            <p className="text-red-600 text-sm mb-2">{modalError}</p>
          )}

          {isSoleManager ? (
            <div>
              <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                Leave Chapter
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Cannot leave - you are the only manager. Promote another member to manager first.
              </p>
            </div>
          ) : (
            <div>
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                // onClick={() => setIsLeaveModalOpen(true)}
                onClick={openModal}  // Use openModal instead
              >
                Leave Chapter
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                You can rejoin by applying again later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveChapterModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        // onClose={closeModal}  // Use the debug version
        chapterSlug={chapterSlug}
        chapterName={chapterName}
      />
    </div>
  );
}