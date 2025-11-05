// lib/validation/rsvpValSchema.ts

import { z } from 'zod';
import { 
  rsvpCountField, 
  rsvpStatusField, 
  eventSlugField 
} from './fields/rsvpFieldValidators';

/**
 * Schema for updating own RSVP (user updates their own)
 */
export const updateMyRsvpSchema = z.object({
  eventSlug: eventSlugField,
  rsvpStatus: rsvpStatusField,
  playersYouth: rsvpCountField,
  playersAdult: rsvpCountField,
  spectatorsAdult: rsvpCountField,
  spectatorsYouth: rsvpCountField,
});

/**
 * Schema for manager updating another member's RSVP
 */
export const updateMemberRsvpSchema = z.object({
  eventSlug: eventSlugField,
  targetUserProfileId: z
    .string()
    .regex(/^\d+$/, 'Invalid user ID')
    .transform(Number),
  rsvpStatus: rsvpStatusField,
  playersYouth: rsvpCountField,
  playersAdult: rsvpCountField,
  spectatorsAdult: rsvpCountField,
  spectatorsYouth: rsvpCountField,
});

// Future: Add createAdHocRsvpSchema for non-member guest RSVPs (post-MVP)
// Will validate name/email instead of userProfileId

// Type exports for TypeScript
export type UpdateMyRsvpInput = z.infer<typeof updateMyRsvpSchema>;
export type UpdateMemberRsvpInput = z.infer<typeof updateMemberRsvpSchema>;