// components/chapter/ApplicantsTabClient.tsx

'use client';

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { ChapterMemberCard } from "./ChapterMemberCard";

interface ChapterMember {
  id: number;
  chapterId: number;
  userProfileId: number;
  memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
  joinedAt: Date;
  userProfile: {
    id: number;
    givenName: string | null;
    familyName: string | null;
    authUser: {
      picture: string | null;
    } | null;
  };
}

interface ApplicantsTabClientProps {
  applicants: ChapterMember[];
  userChapterMember: UserChapterStatus;
}

export function ApplicantsTabClient({ applicants, userChapterMember }: ApplicantsTabClientProps) {
  const handleEdit = (member: ChapterMember) => {
    // TODO: Open management modal
    console.log('Edit member:', member);
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
    </div>
  );
}