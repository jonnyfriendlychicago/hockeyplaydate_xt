// lib/constants/membershipEnums.ts

/**
 * Chapter Member Roles
 * 
 * Represents the various states a user can have in relation to a chapter.
 * These values must match the Prisma enum in schema.prisma
 */
export const MemberRole = {
  /** User has applied but not yet approved */
  APPLICANT: 'APPLICANT',
  
  /** Active member with standard permissions */
  MEMBER: 'MEMBER',
  
  /** Member with elevated permissions (can manage other members) */
  MANAGER: 'MANAGER',
  
  /** User has been blocked by a manager (cannot rejoin) */
  BLOCKED: 'BLOCKED',
  
  /** User was removed by a manager OR voluntarily left */
  REMOVED: 'REMOVED',
  
    // Future states (add to Prisma schema when ready):
    // /** User voluntarily quit/left the chapter */
    // QUIT: 'QUIT',
    // 
    // /** User canceled their application before manager reviewed */
    // CANCELED: 'CANCELED',
    // 
    // /** User is the owner of the chapter.  Can promote/demote managers, make someone else the owner instead of oneself. */
    // OWNER: 'OWNER',

} as const;

/**
 * Type representing valid member role values
 */
export type MemberRoleValue = typeof MemberRole[keyof typeof MemberRole];

/**
 * Helper to check if a string is a valid MemberRole
 */
export function isValidMemberRole(value: string): value is MemberRoleValue {
  return Object.values(MemberRole).includes(value as MemberRoleValue);
}

/**
 * Roles that allow a user to view chapter content
 */
export const ACTIVE_ROLES = [
  MemberRole.MEMBER,
  MemberRole.MANAGER
] as const;

/**
 * Roles that indicate user is not currently part of chapter
 */
export const INACTIVE_ROLES = [
  MemberRole.APPLICANT,
  MemberRole.BLOCKED,
  MemberRole.REMOVED
] as const;

/**
 * Roles that have management permissions
 */
export const MANAGEMENT_ROLES = [
  MemberRole.MANAGER
] as const;

export const MANAGEABLE_ROLES = [
  MemberRole.MEMBER,
  MemberRole.MANAGER,
  MemberRole.BLOCKED,
  MemberRole.REMOVED
] as const;