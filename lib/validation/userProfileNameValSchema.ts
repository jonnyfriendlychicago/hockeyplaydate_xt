// lib/validation/userProfileNameValSchema.ts

import { z } from 'zod';
import { givenNameField, familyNameField } from './fields/nameValidators';

/**
 * Validation schema for minimal name-only user profile form.
 * Enforces same business rules as full profile form:
 * - Required
 * - Max length
 * - Format regex
 * - Profanity filtered
 */

export const userProfileNameValSchema = z.object({
  givenName: givenNameField,
  familyName: familyNameField,
  // above replaces the entire name validation originally below (which was inadquate); now using lib/validation/fields/nameValidators.ts, same as lib/validation/userProfileValSchema.ts
  // givenName: z.string().min(1, 'First name is required'),
  // familyName: z.string().min(1, 'Last name is required'),
});
