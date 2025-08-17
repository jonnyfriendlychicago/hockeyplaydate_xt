// lib/validation/eventValSchema.ts

import { z } from 'zod';
import leoProfanity from 'leo-profanity';
// 101: leo-profanity only matches exact words by default. so the F-word will be caught, but "[F-word]that" will sail thru.  
// This is intentional design in leo-profanity to avoid false positives (e.g. “Scunthorpe problem”). This also makes it useless for altEmail validation: "[F-word]@[F-word].com" sails thru.
// one alternative is to use .loadDictionary() in strict mode or use isProfane() on substrings, but that increases the risk of false positives (e.g. class, Scunthorpe).  
// Shelving this topic for another day. 

// const englishyRegex = /^[a-zA-ZÀ-ÿ'’\-\s.]+$/;

const englishyPlusNumberSymbolsRegex = /^[a-zA-ZÀ-ÿ0-9''\-\s.,!?@#$%&()+=":;/_*]+$/;

export const eventValSchema = z.object({
  
  chapterId: z.number()
    .int('Chapter ID must be a whole number')
    .positive('Chapter ID must be positive'),

  title: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    },
    z.string()
      .nullable()
      .default(null)
      .refine(
        // (val) => val === null || (val.length >= 3 && val.length <= 100),
          (val) => val !== null && val.length >= 3 && val.length <= 100, // replaced above, which was allowing zero-char/null entries
        { message: 'Title must be between 3 and 100 characters if provided' }
      )
      .refine(
        (val) => val === null || !leoProfanity.check(val),
        { message: 'Inappropriate content detected in title. Please use different wording.' }
      )
      .refine(
      (val) => val === null || englishyPlusNumberSymbolsRegex.test(val),
      { message: 'Title contains prohibited characters. Only allowed: letters, numbers, and symbols: .,!?@#$%&()+=":;/_-*' }
      )
  ),

  description: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    },
    z.string()
      .nullable()
      .default(null)
      .refine(
        // (val) => val === null || val.length <= 1000,
        // (val) => val === null || (val.length >= 3 && val.length <= 1000),
        (val) => val !== null && val.length >= 3 && val.length <= 1000, // replaced above, which was allowing zero-char/null entries
        { message: 'Description must be between 3 and 1000 characters if provided' }
      )
      .refine(
        (val) => val === null || !leoProfanity.check(val),
        { message: 'Inappropriate content detected in description. Please use different wording.' }
      )
      .refine(
      (val) => val === null || englishyPlusNumberSymbolsRegex.test(val),
      { message: 'Description contains prohibited characters. Only allowed: letters, numbers, and symbols: .,!?@#$%&()+=":;/_-*' }
      )
  ),

  // Google Maps fields - all optional for now (placeholders)

  venueName: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    },
    z.string()
      .nullable()
      .default(null)
      .refine(
        (val) => val === null || val.length <= 200,
        { message: 'Venue name must be 200 characters or less' }
      )
  ),

  address: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    },
    z.string()
      .nullable()
      .default(null)
      .refine(
        (val) => val === null || val.length <= 300,
        { message: 'Address must be 300 characters or less' }
      )
  ),


  placeId: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return null;
      const trimmed = val.trim();
      return trimmed === '' ? null : trimmed;
    },
    z.string()
      .nullable()
      .default(null)
  ),

  lat: z.number()
    .nullable()
    .default(null)
    .refine(
      (val) => val === null || (val >= -90 && val <= 90),
      { message: 'Latitude must be between -90 and 90' }
    ),

  lng: z.number()
    .nullable()
    .default(null)
    .refine(
      (val) => val === null || (val >= -180 && val <= 180),
      { message: 'Longitude must be between -180 and 180' }
    ),

    bypassAddressValidation: z.boolean()  // ADD THIS
    .default(false),

  // Time fields
  startsAt: z.preprocess(
    (val) => {
      if (val instanceof Date) return val;
      if (typeof val === 'string') {
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    },
    z.date()
      .nullable()
      .default(null)
      .refine(
        (val) => val === null || val > new Date(),
        { message: 'Event start time must be in the future' }
      )
  ),

  durationMin: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        return isNaN(num) ? null : num;
      }
      if (typeof val === 'number') return val;
      return null;
    },
    z.number()
      .nullable()
      .default(null)
      .refine(
        (val) => val === null || (val >= 15 && val <= 480),
        { message: 'Duration must be between 15 minutes and 8 hours if provided' }
      )
  ),

});