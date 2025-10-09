// lib/types/chapterMember.ts

export interface ChapterMemberWithProfile {
  id: number;
  chapterId: number;
  userProfileId: number;
  memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
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
export function getMaskedRole(role: string): string {
  switch (role) {
    case 'APPLICANT': return 'Applicant';
    case 'MEMBER': return 'Member';
    case 'MANAGER': return 'Manager';
    case 'BLOCKED': return 'Blocked';
    case 'REMOVED': return 'Removed';
    default: return role;
  }
}

export function getDisplayName(givenName: string | null, familyName: string | null): string {
  const first = givenName || '';
  const last = familyName || '';
  return `${first} ${last}`.trim() || 'Unknown User';
}

export function getActionButtonText(role: string): string {
  return role === 'APPLICANT' ? 'Review' : 'Manage';
}