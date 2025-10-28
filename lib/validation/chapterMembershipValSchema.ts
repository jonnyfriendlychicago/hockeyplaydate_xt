// lib/validation/chapterMembershipValSchema.ts

import { z } from 'zod';
import { MemberRole, isValidMemberRole } from '@/lib/constants/membershipEnums';

// Slug validation: lowercase letters, numbers, hyphens only
// Min 1 char, max 100 chars for reasonable limits
export const chapterSlugSchema = z.object({
  chapterSlug: z
    .string()
    .min(1, 'Chapter slug is required')
    .max(100, 'Chapter slug too long')
    .regex(/^[a-z0-9-]+$/, 'Invalid chapter slug format')
});

export const updateMemberRoleSchema = z.object({
  chapterSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  chapterMemberId: z.string().regex(/^\d+$/).transform(Number),
  // newRole: z.enum(['MEMBER', 'MANAGER', 'BLOCKED', 'REMOVED'])
  newRole: z.string().refine(
    (val) => isValidMemberRole(val) && val !== MemberRole.APPLICANT,
    { message: 'Invalid member role (cannot set to APPLICANT)' }
  )
});

// Type exports for TypeScript
export type ChapterSlugInput = z.infer<typeof chapterSlugSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;