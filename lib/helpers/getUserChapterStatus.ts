// lib/helpers/getUserChapterStatus.ts
// 2025sep20: should rename this file getUserChapterMember, b/c the new-era name of variable in files that calls this lib file = userChapterMember.  Get around to this soon. 

import { prisma } from '@/lib/prisma';

// prereqs: define types

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
  // devNote: originally, this object was a series of boolean fields, but we enhanced it to include the full chapterMember as a nested object. 
  // that allowed us, upon determining if user is qualifed to access a given feature, to also directly access the full chapterMember/user object. 
  // we considered droping these boolean fields and instead having a field like "chapterUserType" that could be check by === statements, but this is more error prone
  anonVisitor: boolean;
  authVisitor: boolean;
  applicant: boolean;  
  // all of the following member values are terribly named, in retrospect. should have just been the same name as the chapterMember.memberRole field,i.e. member, manager, etc.
  // 20025spt20: too much hassle to fix that right now
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
  
  // 1 - Initialize all chapterMember type flags to false
  let anonVisitor = false;
  let authVisitor = false;
  let applicant = false;
  let genMember = false;
  let mgrMember = false;
  let blockedMember = false;
  let removedMember = false;
  let membership: ChapterMembership | null = null;

  // 2 - set chapterMember type flags
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