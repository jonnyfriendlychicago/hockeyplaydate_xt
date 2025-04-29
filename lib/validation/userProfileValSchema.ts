// lib/validation/userProfileValSchema.ts

import { z } from 'zod';

export const userProfileValSchema = z.object({
  altNickname: z.string().optional(),
  givenName: z.string().min(1, 'First name is required'),
  familyName: z.string().min(1, 'Last name is required'),
  altEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  slugVanity: z
    .string()
    .regex(/^[a-z0-9]+$/i, 'Only alphanumeric characters allowed')
    .min(3, 'At least 3 characters')
    .max(20, 'Max 20 characters')
    .optional()
    .or(z.literal('')),
});
