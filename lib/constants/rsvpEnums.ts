// lib/constants/rsvpEnums.ts

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