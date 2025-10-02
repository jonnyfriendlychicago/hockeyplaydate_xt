// components/chapter/MembersTabClient.tsx

'use client';

import { useState } from "react";
import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { ChapterMemberCard } from "./ChapterMemberCard";
import { ChapterMemberManagementModal } from "./ChapterMemberManagementModal";
import { ChapterMemberWithProfile } from "@/lib/types/chapterMember";

interface MembersTabClientProps {
  members: ChapterMemberWithProfile[];
  userChapterMember: UserChapterStatus;
  chapterSlug: string;
}

export function MembersTabClient({ members, userChapterMember, chapterSlug }: MembersTabClientProps) {
  const [selectedMember, setSelectedMember] = useState<ChapterMemberWithProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (member: ChapterMemberWithProfile) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No members yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chapter Members ({members.length})</h3>
      <div className="space-y-2">
        {members.map((member) => {
          // Hide edit button on user's own card
          const isOwnCard = userChapterMember.membership?.userProfileId === member.userProfileId;
          const showEditButton = userChapterMember.mgrMember && !isOwnCard;

          return (
            <ChapterMemberCard
              key={member.id}
              member={member}
              showEditButton={showEditButton}
              onEdit={handleEdit}
            />
          );
        })}
      </div>

      <ChapterMemberManagementModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        chapterSlug={chapterSlug}
      />
    </div>
  );
}