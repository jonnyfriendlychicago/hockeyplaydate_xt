// app/types/forms/userProfileFormType.ts

import { z } from 'zod';
import { userProfileValSchema } from '@/lib/validation/userProfileValSchema';

// export type UserProfileFormType = z.infer<typeof userProfileValSchema>;
export type UserProfileFormType = z.input<typeof userProfileValSchema>;
// You're not using Zod transforms, so .input and .infer are functionally identical right now, 
// but using .input makes future intent clear and avoids type mismatches if you later add transforms.



// 101: In TypeScript, 'type' is a way to define a custom type alias — kind of like defining a blueprint or shape for your data.
// Rough translation: "A UserProfile object should always have those fields and their types."
// this helps react-hook-form understand what the shape of form data should be.

// export type UserProfileFormType = {
//     altNickname: string;
//     givenName: string;
//     familyName: string;
//     altEmail: string;
//     phone: string;
//     slugVanity: string;
//   };

// above replaced by below, to do it right: 
// Zod's z.infer<typeof schema> is:
// (1) Guaranteed to match your resolver output
// (2) Automatically updated if you change your validation schema
// (3) Strongly typed with zero duplication








  