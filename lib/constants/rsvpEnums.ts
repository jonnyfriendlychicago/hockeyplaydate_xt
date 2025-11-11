// lib/constants/rsvpEnums.ts

/**
 * DEPRECATED FILE - DO NOT USE
 * 
 * This file was created to mimic the membershipEnums.ts pattern, but RSVP
 * status doesn't require the same level of business logic abstraction.
 * 
 * **Use instead:** Import RsvpStatus directly from Prisma
 * 
 * @example
 * import { RsvpStatus } from '@prisma/client';
 * 
 * if (status === RsvpStatus.YES) { ... }
 * 
 * **Why deprecated:**
 * - RSVP status is simple (YES/NO/MAYBE) vs complex member roles
 * - No need for helper groupings like ATTENDING_STATUSES
 * - Direct Prisma enum provides type safety and validation
 * - Reduces maintenance burden and code duplication
 * 
 * **Kept for reference only** - may be deleted after full refactor to Prisma enum
 * 
 * Last used: 2025-11-11
 * Deprecated: 2025-11-11
 * Safe to delete after: All RSVP files migrated to @prisma/client import
 * Recommended never delete: for future reference/reminders. 
 */

/**
 * RSVP Status Values
 * 
 * Represents the possible responses a user can give for an event.
 * These values must match the Prisma enum in schema.prisma
 */
export const RsvpStatus = {
  /** User is attending */
  YES: 'YES',
  
  /** User is not attending */
  NO: 'NO',
  
  /** User might attend (unsure) */
  MAYBE: 'MAYBE',
  
  // Future states (add to Prisma schema when ready):
  // /** User is on waitlist (event full) */
  // WAITLIST: 'WAITLIST',
} as const;

/**
 * Type representing valid RSVP status values
 */
export type RsvpStatusValue = typeof RsvpStatus[keyof typeof RsvpStatus];

/**
 * Helper to check if a string is a valid RsvpStatus
 */
export function isValidRsvpStatus(value: string): value is RsvpStatusValue {
  return Object.values(RsvpStatus).includes(value as RsvpStatusValue);
}

/**
 * Statuses that indicate user is attending
 */
export const ATTENDING_STATUSES = [
  RsvpStatus.YES,
  RsvpStatus.MAYBE
] as const;

/**
 * Statuses that indicate user is NOT attending
 */
export const NOT_ATTENDING_STATUSES = [
  RsvpStatus.NO
] as const;