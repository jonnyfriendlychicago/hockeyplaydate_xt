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

// export type UserProfileNameFormType = z.infer<typeof userProfileNameValSchema>;
// 2025may15: above replaced by below.  Problems with above: 
// - Uses z.infer — this represents the parsed output type, not the raw input.
// - z.infer doesn’t match the shape expected in useForm() if preprocess() is applied, because values like '' won’t validate correctly at runtime.
// - Should be changed to z.input to match the input form values.
// Below makes sure your form uses the same structure as what’s being passed to the Zod schema. 
// This avoids subtle validation bugs (especially from preprocess() logic) and aligns with the pattern you correctly used for the full form.
export type UserProfileNameFormType = z.input<typeof userProfileNameValSchema>;