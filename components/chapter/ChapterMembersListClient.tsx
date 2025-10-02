// components/chapter/ChapterMembersListClient.tsx

'use client';

import { useState } from "react";
import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { ChapterMemberCard } from "./ChapterMemberCard";
import { ChapterMemberManagementModal } from "./ChapterMemberManagementModal";
import { ChapterMemberWithProfile } from "@/lib/types/chapterMember";

interface ChapterMembersListClientProps {
  members: ChapterMemberWithProfile[];
  userChapterMember: UserChapterStatus;
  chapterSlug: string;
  emptyMessage: string;
  title: string;
}

export function ChapterMembersListClient({ 
  members, 
  userChapterMember, 
  chapterSlug,
  emptyMessage,
  title
}: ChapterMembersListClientProps) {
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
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {members.map((member) => {
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