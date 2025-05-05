// lib/validation/userProfileNameValSchema.ts

import { z } from 'zod';

export const userProfileNameValSchema = z.object({
  givenName: z.string().min(1, 'First name is required'),
  familyName: z.string().min(1, 'Last name is required'),
});
