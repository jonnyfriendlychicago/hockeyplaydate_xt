// lib/types/chapterMember.ts

import { MemberRole, type MemberRoleValue } from '@/lib/constants/membershipEnums';

export interface ChapterMemberWithProfile {
  id: number;
  chapterId: number;
  userProfileId: number;
  // memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
  memberRole: MemberRoleValue;
  joinedAt: Date;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  updatedBy?: number | null;
  userProfile: {
    id: number;
    givenName: string | null;
    familyName: string | null;
    slugDefault: string;
    slugVanity: string | null;
    authUser: {
      picture: string | null;
    } | null;
  };
}

// Shared utility functions
// export function getMaskedRole(role: string): string {
//   switch (role) {
//     case 'APPLICANT': return 'Applicant';
//     case 'MEMBER': return 'Member';
//     case 'MANAGER': return 'Manager';
//     case 'BLOCKED': return 'Blocked';
//     case 'REMOVED': return 'Removed';
//     default: return role;
//   }
// }

// above replaced by below, embracing new imported Enum
export function getMaskedRole(role: string): string {
  switch (role) {
    case MemberRole.APPLICANT:
      return 'Applicant';
    case MemberRole.MEMBER:
      return 'Member';
    case MemberRole.MANAGER:
      return 'Manager';
    case MemberRole.BLOCKED:
      return 'Blocked';
    case MemberRole.REMOVED:
      return 'Removed';
    default:
      return 'Unknown';
  }
}

export function getDisplayName(givenName: string | null, familyName: string | null): string {
  const first = givenName || '';
  const last = familyName || '';
  return `${first} ${last}`.trim() || 'Unknown User';
}

export function getActionButtonText(role: string): string {
  // return role === 'APPLICANT' ? 'Review' : 'Manage';
  return role === MemberRole.APPLICANT ? 'Review' : 'Manage';
}