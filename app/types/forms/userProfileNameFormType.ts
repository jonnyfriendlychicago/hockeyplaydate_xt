// app/types/forms/userProfileNameFormType.ts

// export type UserProfileNameFormType = {
//     givenName: string;
//     familyName: string;
//   };

// above replaced by below, to do it right: 
// Zod's z.infer<typeof schema> is:
// (1) Guaranteed to match your resolver output
// (2) Automatically updated if you change your validation schema
// (3) Strongly typed with zero duplication

import { z } from 'zod';
import { userProfileNameValSchema } from '@/lib/validation/userProfileNameValSchema';

export type UserProfileNameFormType = z.infer<typeof userProfileNameValSchema>;
