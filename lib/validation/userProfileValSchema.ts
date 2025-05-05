// lib/validation/userProfileValSchema.ts

import { z } from 'zod';

export const userProfileValSchema = z.object({
  
  // nothing fancy related to familyName, givenName, etc.: these are simple required fields.  
  // note for future development: need max 25 on each name, and if incoming from google is more than 25 for a name, need to trim to that
  familyName: z.string()
  .min(1, 'Last name is required'),

  givenName: z.string()
  .min(1, 'First name is required'),
  
  // altNickname: z.string()
  // // .optional()
  // // .default(''),
  // .nullable()
  // .default(null),

  // above was historic approach to this file, but this wasn't handling nulls correctly needed wholly new approach, shown in all fields below. 
  // 101:  the order does matter when chaining Zod methods like .nullable() and .default().  example in below: this works correctly because: 
  // (1) .nullable() extends the type to allow null (string | null) (2) Then .default(null) says: “if the value is undefined, treat it as null”
  // also, the 'preprocess' is basically taking any incoming empty string and transforming it to null


  // LET'S MAX THIS AT 40
  altNickname: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null)
  ),

  // altEmail: z.string()
  // // .optional()
  // // .default('')
  // .nullable()
  // .default(null)
  // .refine(
  //   // (val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  //   (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  //   { message: 'Above is not a valid email' }
  // ),

  altEmail: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null).refine(
      (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Above is not a valid email' }
    )
  ),

  // phone: z.string()
  // // .optional()
  // // .default('')
  // .nullable()
  // .default(null)
  // .refine(
  //   // (val) => val === '' || /^\d{10}$/.test(val),
  //   (val) => val === null || /^\d{10}$/.test(val),
  //   { message: 'Phone number must contain exactly 10 digits' }
  // ),

  phone: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null).refine(
      (val) => val === null || /^\d{10}$/.test(val),
      { message: 'Phone number must contain exactly 10 digits' }
    )
  ),
  
  // slugVanity: z.string()
  // // .optional()
  // // .default('')
  // .nullable()
  // .default(null)
  // .refine(
  //   // (val) => val === '' || /^[a-z0-9]+$/i.test(val),
  //   (val) => val === null || /^[a-z0-9]+$/i.test(val),
  //   { message: 'Only numbers and letters allowed. Spaces, dashes, symbols, etc. are all prohibited.' }
  // )
  // .refine(
  //   // (val) => val.length === 0 || (val.length >= 3 && val.length <= 20), 
  //   (val) => val === null || val.length === 0 || (val.length >= 3 && val.length <= 20),
  //   {message: 'Must be between 3 and 20 characters if provided',
  // })

  slugVanity: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null)
      .refine(
        (val) => val === null || /^[a-z0-9]+$/i.test(val),
        { message: 'Only numbers and letters allowed. Spaces, dashes, symbols, etc. are all prohibited.' }
      )
      .refine(
        (val) => val === null || (val.length >= 3 && val.length <= 20),
        { message: 'Must be between 3 and 20 characters if provided' }
      )
  )

});

// familyName: z.string().min(1, 'Last name is required'),
// givenName: z.string().min(1, 'First name is required'),

// altNickname: z.string().optional().default(''),

// altEmail: z.string().email('Above is not a valid email').or(z.literal('')).optional().default(''),

// phone: z
// .string()
// .regex(/^\d{10}$/, 'Phone number must contain exactly 10 digits'),

// slugVanity: z
// .string()
// .regex(/^[a-z0-9]+$/i, 'Only numbers and letters allowed. Spaces, dashes, symbols, etc. are all prohibited.')
// .min(3, 'Minimum 3 characters required')
// .max(20, 'Max 20 characters')
// .or(z.literal(''))
// .optional()
// .default(''),



// note: in our react hook form, default values are always set to a string (e.g. phone: userProfile.phone ?? ''), and React Hook Form expects those fields to always be present., that's good.
// so we need to likewise ensure that this zod schema doesn't embrace undefined/nulls, but rather embraces the empty string as well.  Hence the `.default('')` instead of `.optional()` in lines below.
// doing so tells Zod: this field is always a string — if it’s missing, default it to ''










// below cleanses any phone number the user entered, and validates for 10 digits or blank
// phone: z
// .string()
// .default('') // Allows field to be blank if user chooses not to provide it
// .transform((val) => (val ?? '').replace(/\D/g, '')) // Remove all non-digit characters
// .refine(
  //   (val) => val === '' || val.length === 10,
  //   { message: 'Phone number must contain exactly 10 digits' }
  // ), 
  
  // altEmail: z.string().email('Above is not a valid email').optional().or(z.literal('')),
  
  // slugVanity: z
  // .string()
  // .regex(/^[a-z0-9]+$/i, 'Only numbers and letters allowed. Spaces, dashes, symbols, etc. are all prohibited.')
  // .min(3, 'Minimum 3 characters required')
  // .max(20, 'Max 20 characters')
  // .or(z.literal(''))
  // .default(''),
  
  // altEmail: z.string().email('Above is not a valid email').or(z.literal('')).default(''),  
  // altNickname: z.string().default(''),