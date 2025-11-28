// lib/helpers/getUserChapterMembership.ts

import { prisma } from '@/lib/prisma';
import { MemberRole } from '@prisma/client';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { getUserDisplayName } from '@/lib/helpers/getUserDisplayName';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Membership record shape (no database IDs exposed!)
 */
type ChapterMembershipRecord = {
  presentableId: string;
  memberRole: MemberRole;
  joinedAt: Date;
  joinRequestCount: number | null;
  joinRequestWindowStart: Date | null;
};

/**
 * Chapter info shape
 */
type ChapterInfo = {
  slug: string;
  name: string | null;
};

/**
 * Comprehensive status object returned by getUserChapterMembership
 * 
 * Provides:
 * - Individual role booleans (isManager, isMember, etc.)
 * - Composite booleans for common checks (hasAccess, canJoinOrRejoin, etc.)
 * - Pre-formatted display values (no raw IDs exposed)
 * - Membership record when needed for updates
 */
export type ChapterMembershipStatus = {
  // === Individual Role Booleans ===
  /** User is not logged in */
  isAnonymous: boolean;
  /** User is logged in but has no membership record for this chapter */
  isNonMember: boolean;
  /** User has applied but not yet approved */
  isApplicant: boolean;
  /** User is an active member */
  isMember: boolean;
  /** User is a manager with elevated permissions */
  isManager: boolean;
  /** User has been blocked by a manager */
  isBlocked: boolean;
  /** User was removed or voluntarily left */
  isRemoved: boolean;
  
  // === Composite Booleans (common checks) ===
  /** User is MEMBER or MANAGER - can access chapter content */
  hasAccess: boolean;
  /** User can request to join: isNonMember or isRemoved */
  canJoinOrRejoin: boolean;
  /** User can manage other members: same as isManager */
  canManageMembers: boolean;
  
  // === Raw Data (no database IDs!) ===
  /** The raw MemberRole enum value, or null if no membership */
  memberRole: MemberRole | null;
  /** Membership record for updates (no database ID exposed) */
  membership: ChapterMembershipRecord | null;
  
  // === Display Values ===
  /** Pre-formatted display name, e.g. "Jon Friend", or null if anonymous */
  authenticatedUserDisplayName: string | null;
  
  // === Chapter Info ===
  /** Chapter slug and name for convenience */
  chapter: ChapterInfo | null;
  
  /** Authenticated user's slug for server-side lookups */
  authenticatedUserSlug: string | null;
};

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Determines a user's relationship status with a specific chapter.
 * 
 * This function:
 * 1. Gets the authenticated user internally
 * 2. Looks up the chapter by slug
 * 3. Checks membership status
 * 4. Returns comprehensive status with booleans and display values
 * 
 * @param chapterSlug - The chapter's URL slug
 * @returns ChapterMembershipStatus with all relevant flags and data
 * 
 * @example
 * const userChapterMember = await getUserChapterMembership('chicago-central');
 * 
 * if (userChapterMember.isAnonymous) {
 *   redirect('/auth/login');
 * }
 * 
 * if (!userChapterMember.hasAccess) {
 *   return <AccessDenied />;
 * }
 * 
 * {userChapterMember.isManager && <EditButton />}
 */
export async function getUserChapterMembership(
  chapterSlug: string
): Promise<ChapterMembershipStatus> {
  
  // 1 - Get authenticated user
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull();
  
  // 2 - Initialize default status (anonymous user, no chapter found)
  const defaultStatus: ChapterMembershipStatus = {
    // Individual booleans
    isAnonymous: true,
    isNonMember: false,
    isApplicant: false,
    isMember: false,
    isManager: false,
    isBlocked: false,
    isRemoved: false,
    // Composite booleans
    hasAccess: false,
    canJoinOrRejoin: false,
    canManageMembers: false,
    // Raw data
    memberRole: null,
    membership: null,
    // Display values
    authenticatedUserDisplayName: null,
    // Chapter info
    chapter: null,
    authenticatedUserSlug: null, 
    
  };
  
  // 3 - Look up chapter by slug
  const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug },
    select: { 
      id: true,  // Used internally only
      slug: true,
      name: true,
    }
  });
  
  // If chapter doesn't exist, return default (anonymous-like) status
  if (!chapter) {
    return defaultStatus;
  }
  
  // 4 - Set chapter info
  const chapterInfo: ChapterInfo = {
    slug: chapter.slug,
    name: chapter.name,
  };
  
  // 5 - If no authenticated user, return anonymous status with chapter info
  if (!authenticatedUserProfile) {
    return {
      ...defaultStatus,
      chapter: chapterInfo,
    };
  }
  
  // 6 - User is authenticated - get display name and slug
  const authenticatedUserDisplayName = getUserDisplayName(authenticatedUserProfile);
  const authenticatedUserSlug = authenticatedUserProfile.slugDefault;
  
  // 7 - Look up membership record
  const membership = await prisma.chapterMember.findFirst({
    where: {
      userProfileId: authenticatedUserProfile.id,
      chapterId: chapter.id,
    },
    select: {
      presentableId: true,
      memberRole: true,
      joinedAt: true,
      joinRequestCount: true,
      joinRequestWindowStart: true,
    }
  });
  
  // 8 - If no membership record, user is authenticated non-member
  if (!membership) {
    return {
      ...defaultStatus,
      isAnonymous: false,
      isNonMember: true,
      canJoinOrRejoin: true,
      authenticatedUserDisplayName,
      authenticatedUserSlug,
      chapter: chapterInfo,
    };
  }
  
  // 9 - User has membership - determine role booleans
  const isApplicant = membership.memberRole === MemberRole.APPLICANT;
  const isMember = membership.memberRole === MemberRole.MEMBER;
  const isManager = membership.memberRole === MemberRole.MANAGER;
  const isBlocked = membership.memberRole === MemberRole.BLOCKED;
  const isRemoved = membership.memberRole === MemberRole.REMOVED;
  
  // 10 - Compute composite booleans
  const hasAccess = isMember || isManager;
  const canJoinOrRejoin = isRemoved;  // Only removed users can rejoin
  const canManageMembers = isManager;
  
  // 11 - Build membership record (no database ID!)
  const membershipRecord: ChapterMembershipRecord = {
    presentableId: membership.presentableId,
    memberRole: membership.memberRole,
    joinedAt: membership.joinedAt,
    joinRequestCount: membership.joinRequestCount,
    joinRequestWindowStart: membership.joinRequestWindowStart,
  };
  
  // 12 - Return complete status
  return {
    // Individual booleans
    isAnonymous: false,
    isNonMember: false,
    isApplicant,
    isMember,
    isManager,
    isBlocked,
    isRemoved,
    // Composite booleans
    hasAccess,
    canJoinOrRejoin,
    canManageMembers,
    // Raw data
    memberRole: membership.memberRole,
    membership: membershipRecord,
    // Display values
    authenticatedUserDisplayName,
    authenticatedUserSlug,
    // Chapter info
    chapter: chapterInfo,
  };
}