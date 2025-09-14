// lib/helpers/getUserChapterStatus.ts

import { prisma } from '@/lib/prisma';

type UserProfile = {
  id: number;
  userId: number | null;
  // ... other fields as needed
};

type ChapterMembership = {
  id: number;
  chapterId: number;
  userProfileId: number;
  // memberRole: 'MEMBER' | 'MANAGER' | 'BLOCKED';
  memberRole: 'APPLICANT' | 'MEMBER' | 'MANAGER' | 'BLOCKED' | 'REMOVED';
  joinedAt: Date;
};

export type UserChapterStatus = {
  anonVisitor: boolean;
  authVisitor: boolean;
  applicant: boolean;  
  genMember: boolean;
  mgrMember: boolean;
  blockedMember: boolean;
  removedMember: boolean;    
  membership: ChapterMembership | null;
};

/**
 * Determines user's relationship status with a specific chapter
 * Extracted from chapter page logic for reuse across events, etc.
 * 
 * @param chapterId - The chapter ID to check membership for
 * @param authenticatedUserProfile - The authenticated user profile (null if not logged in)
 * @returns UserChapterStatus object with boolean flags for each user type
 */
export async function getUserChapterStatus(
  chapterId: number, 
  authenticatedUserProfile: UserProfile | null
): Promise<UserChapterStatus> {
  
  // Initialize all status flags to false
  let anonVisitor = false;
  let authVisitor = false;
  let applicant = false;
  let genMember = false;
  let mgrMember = false;
  let blockedMember = false;
  let removedMember = false;
  let membership: ChapterMembership | null = null;

  if (!authenticatedUserProfile) {
    // User is not logged in
    anonVisitor = true;
  } else {
    // User is logged in - check their membership status
    membership = await prisma.chapterMember.findFirst({
      where: {
        userProfileId: authenticatedUserProfile.id,
        chapterId: chapterId,
      },
    });

    // if (!membership) {
    //   // Logged in but not a member of this chapter
    //   authVisitor = true;
    // } else if (membership.memberRole === 'BLOCKED') {
    //   // Member but blocked
    //   blockedMember = true;
    // } else if (membership.memberRole === 'MANAGER') {
    //   // Manager member
    //   mgrMember = true;
    // } else {
    //   // Regular member (memberRole === 'MEMBER')
    //   genMember = true;
    // }
     if (!membership) {
      authVisitor = true;
    } else if (membership.memberRole === 'APPLICANT') {
      applicant = true;
    } else if (membership.memberRole === 'MEMBER') {
      genMember = true;
    } else if (membership.memberRole === 'MANAGER') {
      mgrMember = true;
    } else if (membership.memberRole === 'BLOCKED') {
      blockedMember = true;
    } else if (membership.memberRole === 'REMOVED') {
      removedMember = true;
    }
  }

  return {
    anonVisitor,
    authVisitor,
    applicant, 
    genMember,
    mgrMember,
    blockedMember,
    removedMember,
    membership,
  };
}