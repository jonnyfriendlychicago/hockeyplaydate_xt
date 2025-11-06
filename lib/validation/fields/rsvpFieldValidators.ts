// lib/validation/fields/rsvpFieldValidators.ts

import { z } from 'zod';
import { isValidRsvpStatus } from '@/lib/constants/rsvpEnums';

/**
 * Shared validator for RSVP count fields (players/spectators).
 * - Validates string input
 * - Transforms to number
 * - Enforces 0-10 range
 */
export const rsvpCountField = z
  .string()
  .regex(/^\d+$/, 'Must be a number')
  .transform(Number)
  .pipe(z.number().min(0, 'Cannot be negative').max(10, 'Maximum 10 allowed'));

/**
 * Shared validator for RSVP status field.
 * - Enforces YES/NO/MAYBE enum
 */
// export const rsvpStatusField = z.enum(['YES', 'NO', 'MAYBE'], {
//   errorMap: () => ({ message: 'Invalid RSVP status' })
// });
// above replaced by below, embracing imported enum
export const rsvpStatusField = z.string().refine(
  (val) => isValidRsvpStatus(val),
  { message: 'Invalid RSVP status' }
);

/**
 * Shared validator for event slug field.
 * - Required, 1-100 chars
 */
export const eventSlugField = z
  .string()
  .min(1, 'Event slug is required')
  .max(100, 'Event slug too long');