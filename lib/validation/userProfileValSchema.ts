// lib/validation/userProfileValSchema.ts

// action item: nothing in this file is engaging that leoProfanity library we set up for syncUser.ts.  That should be part of this, if possible/practical.

import { z } from 'zod';
import validator from 'validator'; // npm install --save-dev @types/validator
import leoProfanity from 'leo-profanity'; // npm install leo-profanity
// 101: leo-profanity only matches exact words by default. so the F word will be caught, but Fwrdthat will said thru.  
// This is intentional design in leo-profanity to avoid false positives (e.g. “Scunthorpe problem”). This also makes it useless for altEmail validation: badword@badword.com sails thru.
// one alternative is to use .loadDictionary() in strict mode or use isProfane() on substrings, but that increases the risk of false positives (e.g. class, Scunthorpe).  
// Shelving this topic for another day. 

const englishyRegex = /^[a-zA-ZÀ-ÿ'’\-\s.]+$/;

export const userProfileValSchema = z.object({
  
  // nothing fancy related to familyName, givenName, etc.: these are simple required fields.  
  // actionItem: : need max 25 on each name, and if incoming from google is more than 25 for a name, need to trim to that
  familyName: z
  .string()
  .min(1, 'Last name is required')
  .max(25, 'Last name is too long. 25 characters max.')
  .refine(
    (val) => englishyRegex.test(val),
    { message: 'Entered name contains prohibited characters.' }
  )
  .refine((val) => !leoProfanity.check(val), {
    message: 'Inappropriate content detected. Please use a different name.',})
  ,

  givenName: z
  .string()
  .min(1, 'First name is required')
  .max(25, 'First name is too long. 25 characters max.')
  .refine(
    (val) => englishyRegex.test(val),
    { message: 'Entered name contains prohibited characters.' }
  )
  .refine((val) => !leoProfanity.check(val), {
    message: 'Inappropriate content detected. Please use a different name.',}
  ), 
  
  // altNickname: z.string()
  // // .optional()
  // // .default(''),
  // .nullable()
  // .default(null),

  // above was historic approach to this file, but this wasn't handling nulls correctly needed wholly new approach, shown in all fields below. 
  // 101:  the order does matter when chaining Zod methods like .nullable() and .default().  example in below: this works correctly because: 
  // (1) .nullable() extends the type to allow null (string | null) (2) Then .default(null) says: “if the value is undefined, treat it as null”
  // also, the 'preprocess' is basically taking any incoming empty string and transforming it to null

  altNickname: z.preprocess(
    (val) => val === '' ? null : val,
    z.string()
    .max(45, 'Family Brand Name is too long. 45 characters max.')
    .nullable()
    .default(null)
    .refine(
      (val) => val === null || englishyRegex.test(val),
      { message: 'Entered name contains prohibited characters.' }
    )
    .refine(
      (val) => val === null || !leoProfanity.check(val),
      // (val) => !leoProfanity.check(val), 
      {message: 'Inappropriate content detected. Please use a different name.'}
    )
  ),

  altEmail: z.preprocess(
    (val) => val === '' ? null : val,
    z.string()
    .nullable()
    .default(null)
    .refine(
      // (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), // this is a home-grown incomplete means of validating email values
      (val) => val === null || validator.isEmail(val), // this uses the validator library, much more complete and reliable
      { message: 'Above is not a valid email' }
    )
  ),

  phone: z.preprocess(
    (val) => val === '' ? null : val,
    z.string()
    .nullable()
    .default(null)
    .refine(
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
      .refine(
        (val) => val === null || !leoProfanity.check(val),
        {message: 'Inappropriate content detected. Please use a different name.'}
      )
  )
});