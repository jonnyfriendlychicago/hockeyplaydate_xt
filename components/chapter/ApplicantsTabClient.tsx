// components/chapter/ApplicantsTabClient.tsx

'use client';

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { ChapterMemberCard } from "./ChapterMemberCard";
import { ChapterMemberManagementModal } from "./ChapterMemberManagementModal";
import { useState } from "react";
import { ChapterMemberWithProfile } from "@/lib/types/chapterMember";

interface ApplicantsTabClientProps {
  applicants: ChapterMemberWithProfile[];
  userChapterMember: UserChapterStatus;
  chapterSlug: string;
}

export function ApplicantsTabClient({ applicants, userChapterMember , chapterSlug}: ApplicantsTabClientProps) {

  // const [selectedMember, setSelectedMember] = useState<ChapterMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<ChapterMemberWithProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const handleEdit = (member: ChapterMember) => {
  const handleEdit = (member: ChapterMemberWithProfile) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  if (applicants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pending applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pending Applications ({applicants.length})</h3>
      <div className="space-y-2">
        {applicants.map((applicant) => (
          <ChapterMemberCard
            key={applicant.id}
            member={applicant}
            showEditButton={userChapterMember.mgrMember}
            onEdit={handleEdit}
          />
        ))}
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