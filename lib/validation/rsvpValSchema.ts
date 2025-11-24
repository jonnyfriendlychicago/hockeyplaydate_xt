// lib/validation/rsvpValSchema.ts

import { z } from 'zod';
import { 
  rsvpCountField, 
  rsvpStatusField, 
  eventSlugField 
} from './fields/rsvpFieldValidators';
import { RsvpStatus } from '@prisma/client';

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
}).refine(
  (data) => {
    // If status is YES, must have at least one person attending
    if (data.rsvpStatus === RsvpStatus.YES) {
      const totalPeople = 
        data.playersYouth + 
        data.playersAdult + 
        data.spectatorsAdult + 
        data.spectatorsYouth;
      return totalPeople > 0;
    }
    return true; // NO/MAYBE don't need counts
  },
  {
    message: "At least one person (player or spectator) is required when RSVP status is YES",
    path: ["playersYouth"], // Attach error to first field
  }
);

/**
 * Schema for manager updating another member's RSVP
 */
export const updateMemberRsvpSchema = z.object({
  eventSlug: eventSlugField,
  // targetUserProfileId: z
  //   .string()
  //   .regex(/^\d+$/, 'Invalid user ID')
  //   .transform(Number),
  targetUserSlug: z.string().min(1),  
  rsvpStatus: rsvpStatusField,
  playersYouth: rsvpCountField,
  playersAdult: rsvpCountField,
  spectatorsAdult: rsvpCountField,
  spectatorsYouth: rsvpCountField,
}).refine(
  (data) => {
    // If status is YES, must have at least one person attending
    if (data.rsvpStatus === RsvpStatus.YES) {
      const totalPeople = 
        data.playersYouth + 
        data.playersAdult + 
        data.spectatorsAdult + 
        data.spectatorsYouth;
      return totalPeople > 0;
    }
    return true; // NO/MAYBE don't need counts
  },
  {
    message: "At least one person (player or spectator) is required when RSVP status is YES",
    path: ["playersYouth"], // Attach error to first field
  }
);

// Future: Add createAdHocRsvpSchema for non-member guest RSVPs (post-MVP)
// Will validate name/email instead of userProfileId

// Type exports for TypeScript
export type UpdateMyRsvpInput = z.infer<typeof updateMyRsvpSchema>;
export type UpdateMemberRsvpInput = z.infer<typeof updateMemberRsvpSchema>;