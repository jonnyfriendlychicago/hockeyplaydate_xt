// components/chapter/ChapterMemberCard.tsx

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { 
  ChapterMemberWithProfile, 
  getMaskedRole, 
  getDisplayName, 
  getActionButtonText 
} from "@/lib/types/chapterMember";

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
//     slugDefault: string; 
//     slugVanity: string; 
//     authUser: {
//       picture: string | null;
//     } | null;
//   };
// }

interface ChapterMemberCardProps {
  // member: ChapterMember;
  member: ChapterMemberWithProfile;
  showEditButton: boolean;
  // onEdit?: (member: ChapterMember) => void;
  onEdit?: (member: ChapterMemberWithProfile) => void;
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

// function getActionButtonText(role: string): string {
//   return role === 'APPLICANT' ? 'Respond' : 'Manage';
// }

export function ChapterMemberCard({ member, showEditButton, onEdit }: ChapterMemberCardProps) {
  const displayName = getDisplayName(member.userProfile.givenName, member.userProfile.familyName);
  const maskedRole = getMaskedRole(member.memberRole);
  const profilePicture = member.userProfile.authUser?.picture;
  const sluggy = member?.userProfile?.slugVanity || member?.userProfile?.slugDefault;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="relative w-10 h-10">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name and Role */}
        <div>
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-muted-foreground">{maskedRole}</p>
          <Link href={`/member/${sluggy}`} className="text-xs text-blue-600 hover:underline">
            View Profile
          </Link>
        </div>
      </div>

      {/* Action Button */}
      {showEditButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(member)}
          className="flex items-center gap-1"
        >
          <Edit className="w-4 h-4" />
          {getActionButtonText(member.memberRole)}
        </Button>
      )}
    </div>
  );
}