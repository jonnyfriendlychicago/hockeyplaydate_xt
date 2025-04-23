// lib/syncUser.ts
import { prisma } from './prisma';
import { customAlphabet } from 'nanoid'; // 2025apr10: used to remove possiblity of spelling unsavory words in defaultSlug generation
import slugify from 'slugify'; // npm install slugify
import leoProfanity from 'leo-profanity'; // npm install leo-profanity

type Auth0User = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
};

// BEGIN: referenced functions
// 101: below are are functions, but more specifically, each is executing a factory that returns a function; this is a utility constant.  That  why each is written as a "const"
const nanoidAlphaNumeric = customAlphabet('bcdfghjklmnpqrstvwxyz0123456789', 8); // Safe characters only: consonants + digits (no vowels to avoid accidental words)
const nanoidDigitsFour = customAlphabet('2345789', 4); // missing 1 and 6, for clarity and avoiding awkward numbers
const nanoidDigitsTwo = customAlphabet('2345789', 2); // missing 1 and 6, for clarity and avoiding awkward numbers
// 101: Below are custom functions built in this file, and as such, the code types/arranges better to write starting with keyword "function" (or, "async function", etc.)

async function generateDefaultSlugFunc(): Promise<string> {
  do {
    const attemptedDefaultSlug = nanoidAlphaNumeric(); 

    const existing = await prisma.userProfile.findFirst({
      where: {
        OR: [
          { slugDefault: attemptedDefaultSlug },
          { slugVanity: attemptedDefaultSlug },
        ],
      },
    });

    if (!existing) {
      return attemptedDefaultSlug;
    }
  } while (true); // this function will keep firing a trillion+ times, approaching infinite, if that's what it takes to get a new unique value.  Ever needing to run even twice, let alone more, is a practical impossibility.
}

function sanitizeNameFunc(name: string | undefined | null): string | null {
  // case 1:  if incoming value is null, undefined, empty string, or string of empty spaces, return null
  if (!name || !name.trim()) return null;
  // set up next cases: arrived here b/c incoming value has at least one non-space char.  Next line removes both leading and trailng blank spaces, then whacks char 25 onward
  const nameTrimmedAndCropped = name.trim().slice(0, 24); 
  // case 2: if has bad words, return null
  if (leoProfanity.check(nameTrimmedAndCropped)) return null;
  // set up next case: contains ONLY letters (including accented), spaces, apostrophes, hyphens, and periods
  const isEnglishyFormat = /^[a-zA-ZÀ-ÿ'’\-\s.]+$/.test(nameTrimmedAndCropped); 
  // note: 'isEnglishyFormat' here is quick/dirty description.  Basically, checks for any char that is not one of following: 
  // (a) a-zA-Z / standard ASCII letters; 
  // (b) À-ÿ  / extended Latin letters like é, ö, ñ, etc.
  // (c) '’ / straight or curly apostrophes
  // (d) hyphens, spaces or periods.  
  // this all means that Anne-Marie St. Germaine, Renée Zell, Zoë Dash, Jean-Luc Picard, and D’Angelo Brownsugar et al will be accepted, but Asian / Sanskrit / Arabic / Cyrillic / etc. won't pass
  // As of 2025, this web application and client business are not prepared to support such non-Englishy languages/characters. 
  // case 3: validFormat?  if so, return it, if else, return null and be done
  return isEnglishyFormat ? nameTrimmedAndCropped : null; // isEnglishyFormat is a ternary function, so using ternary operator with it: if true is returned by isEnglishyFormat, then return the nameTrimmedAndCropped; else, return null
}

async function generateVanitySlugFunc(
  incomingCleanGivenName: string | null, 
  incomingCleanFamilyName: string | null 
): Promise<string | null> {
  // Step 1: establish baseline variable, and quit if both incomingGivenName and incomingFamilyName is null / nullish
  const concatGivenNameFamilyName = `${incomingCleanGivenName ?? ''}${incomingCleanFamilyName ?? ''}`.trim();
  if (!concatGivenNameFamilyName) return null;  
  // Step 2: slugify the variable, and quit if somehone that results in null 
  const slugifiedConcatGivenFamilyName  = slugify(concatGivenNameFamilyName, { // slugify function makes URL-safe slugs: changes space to -, strips symbols/accents, etc.  Probably overkill here, b/c we are replacing with '' anything not a-thru-z and 0-9.  But if is lower-ing everything.  Either way, good for future utilization/reference.
    lower: true,
    strict: true,
    locale: 'en', // needed? 
  }).replace(/[^a-z0-9]/g, '').slice(0, 24); // remove any chars that are not a-thru-z and 0-9, then whack char 25 onward
  if (!slugifiedConcatGivenFamilyName) return null;  // this is a double-check: if somehow (even tho it shouldn't be possible at this point) the slugifiedConcatGivenFamilyName got set to null by the slugify/replace/slice process, then return null / escape the function. 
  // Step 3: Explore/resolve length-based cases
  // Case A: base slug is already long enough
  if (slugifiedConcatGivenFamilyName.length >= 4) {
    // Step (i): check if slugifiedConcatGivenFamilyName exists
    const existsSlugifiedConcatGivenFamilyName = await prisma.userProfile.findFirst({
      where: {
        OR: [
          { slugDefault: slugifiedConcatGivenFamilyName },
          { slugVanity: slugifiedConcatGivenFamilyName },
        ],
      },
    });
  
    if (!existsSlugifiedConcatGivenFamilyName) {
      return slugifiedConcatGivenFamilyName;
    }

    // Step (ii): try appending numeric padding to slugifiedConcatGivenFamilyName, see if we can quickly get a new unique value that way
    const maxAttempts = 40; // fyi, the nanoidDigitsTwo function has 49 possible unique resulting values
    for (let i = 0; i < maxAttempts; i++) {
      const paddedSlugifiedConcatGivenFamilyName = `${slugifiedConcatGivenFamilyName}${nanoidDigitsTwo()}`; // e.g., jonfriend4832

      const exists = await prisma.userProfile.findFirst({
        where: {
          OR: [
            { slugDefault: paddedSlugifiedConcatGivenFamilyName },
            { slugVanity: paddedSlugifiedConcatGivenFamilyName },
          ],
        },
      });

      if (!exists) {
        return paddedSlugifiedConcatGivenFamilyName;
      }
    }

  // If neither step 1 nor step 2 returns a value, then give up: vanitySlug will be set to null
  return null;
  }

  // Case 2: slugifiedConcatGivenFamilyName is too short? Then pad and retry
  const maxAttempts = 40; // fyi, the nanoidDigitsFour function has 2,401 possible unique resulting values
  for (let i = 0; i < maxAttempts; i++) {
    const paddedSlugifiedConcatGivenFamilyName = `${slugifiedConcatGivenFamilyName}${nanoidDigitsFour()}`; // e.g. bo4832

    const exists = await prisma.userProfile.findFirst({
      where: {
        OR: [{ slugDefault: paddedSlugifiedConcatGivenFamilyName }, { slugVanity: paddedSlugifiedConcatGivenFamilyName }],
      },
    });

    if (!exists) {
      return paddedSlugifiedConcatGivenFamilyName;
    }
  }

  // Final give-up: after all that trying we still can't come up with a good vanitySlug, it wasn't meant to be.  
  // It's okay, user will just have defaultSlug and can downstream use the GUI to try making his own vanitySlug. 
  return null;
}

function generateAltNicknameFunc( // proactively set userProfile.altNickname, e.g. "The Smith Family"
  incomingCleanFamilyName: string | null 
): string | null {
  // Step 1: quit if incomingFamilyName is null
  if ( !incomingCleanFamilyName) return null;  // if incomingFamilyName is null, nothing more to do, return null.  Else... 
  // Step 2: return familyName wrapped in title-like text
  return `The ${incomingCleanFamilyName} Family`;
}

// END: referenced functions

export async function syncUserFromAuth0(receivedA0userObj: Auth0User) {
  if (!receivedA0userObj?.sub || !receivedA0userObj.email) return;

  const dbAuthUser = await prisma.authUser.upsert({
    where: { auth0Id: receivedA0userObj.sub },
    update: {
      email: receivedA0userObj.email,
      emailVerified: receivedA0userObj.email_verified ?? false, // 101: The ?? operator is the nullish coalescing operator. It returns the right-hand value only if the left-hand value is null or undefined.
      name: receivedA0userObj.name ?? null,
      givenName: receivedA0userObj.given_name ?? null,
      familyName: receivedA0userObj.family_name ?? null,
      nickname: receivedA0userObj.nickname ?? null,
      picture: receivedA0userObj.picture ?? null,
    },
    create: {
      auth0Id: receivedA0userObj.sub,
      email: receivedA0userObj.email,
      emailVerified: receivedA0userObj.email_verified ?? false,
      name: receivedA0userObj.name ?? null,
      givenName: receivedA0userObj.given_name ?? null,
      familyName: receivedA0userObj.family_name ?? null,
      nickname: receivedA0userObj.nickname ?? null,
      picture: receivedA0userObj.picture ?? null,
    },
  });

  // check: does userProfile record exist for this authUser record?  (if returning login, it surely does; if first-time login, it doesn't)
  const existingProfile = await prisma.userProfile.findUnique({
    where: { userId: dbAuthUser.id },
  });

  let dbUserProfile;
  
  if (!existingProfile) { // if not, proceed to create it

    // create value to populate userProfile.slugDefault
    const sluggyDefault = await generateDefaultSlugFunc(); 
    // create value to populate userProfile.givenName; could make cleanGivenName = null, even if Auth0 delivered a givenName
    const cleanGivenName = sanitizeNameFunc(receivedA0userObj.given_name); 
    // ditto above but for userProfile.familyName
    const cleanFamilyName = sanitizeNameFunc(receivedA0userObj.family_name); 
    // create value to populate userProfile.slugVanity
    const sluggyVanity = await generateVanitySlugFunc(cleanGivenName, cleanFamilyName);  
    // create value to populate userProfile.altNickname
    const altyNickname = generateAltNicknameFunc(cleanFamilyName); 

    dbUserProfile = await prisma.userProfile.create({
      data: {
        userId: dbAuthUser.id,
        slugDefault: sluggyDefault, 
        slugVanity: sluggyVanity,  
        givenName: cleanGivenName,
        familyName: cleanFamilyName,
        altNickname: altyNickname 
      },
    });
  } else { 
    dbUserProfile = existingProfile;
  }

  // return dbAuthUser; 
  return dbUserProfile; 
}