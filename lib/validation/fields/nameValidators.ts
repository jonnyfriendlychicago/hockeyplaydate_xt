// lib/validation/fields/nameValidators.ts

import { z } from 'zod';
import leoProfanity from 'leo-profanity';

// Matches common English-like names including accents, hyphens, apostrophes, and periods
const englishyRegex = /^[a-zA-ZÀ-ÿ'’\-\s.]+$/;

/**
 * Shared validator for givenName field.
 * - Trims input
 * - Requires 1–25 characters
 * - Validates format and profanity
 */
export const givenNameField = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim() : val),
  z.string()
    .min(1, 'First name is required')
    .max(25, 'First name is too long. 25 characters max.')
    .refine((val) => englishyRegex.test(val), {
      message: 'Entered name contains prohibited characters.',
    })
    .refine((val) => !leoProfanity.check(val), {
      message: 'Inappropriate content detected. Please use a different name.',
    })
);

/**
familyNameField has the exact same validation logic as givenNameField; 
repeated b/c that's easiser than doing a whole separate helper function 
to be imported only twice 
 */
export const familyNameField = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim() : val),
  z.string()
    .min(1, 'Last name is required')
    .max(25, 'Last name is too long. 25 characters max.')
    .refine((val) => englishyRegex.test(val), {
      message: 'Entered name contains prohibited characters.',
    })
    .refine((val) => !leoProfanity.check(val), {
      message: 'Inappropriate content detected. Please use a different name.',
    })
);
