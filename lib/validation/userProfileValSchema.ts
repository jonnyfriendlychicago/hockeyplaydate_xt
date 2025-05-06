// lib/validation/userProfileValSchema.ts

// action item: nothing in this file is engaging that leoProfanity library we set up for syncUser.ts.  That should be part of this, if possible/practical.

import { z } from 'zod';

export const userProfileValSchema = z.object({
  
  // nothing fancy related to familyName, givenName, etc.: these are simple required fields.  
  // actionItem: : need max 25 on each name, and if incoming from google is more than 25 for a name, need to trim to that
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

  // actionItem: LET'S MAX THIS AT 40
  altNickname: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null)
  ),

  altEmail: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null).refine(
      (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Above is not a valid email' }
    )
  ),

  phone: z.preprocess(
    (val) => val === '' ? null : val,
    z.string().nullable().default(null).refine(
      (val) => val === null || /^\d{10}$/.test(val),
      { message: 'Phone number must contain exactly 10 digits' }
    )
  ),
  
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