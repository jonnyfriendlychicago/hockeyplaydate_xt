// lib/idGenerators/alphanumeric8char.ts
import { customAlphabet } from 'nanoid';

// Alphanumeric generator using safe characters (consonants + digits)
// Excludes vowels to avoid accidental profanity or words 
const nanoidAlphaNumeric8char = customAlphabet('bcdfghjkmnpqrstvwxyz2345789', 8);

export { nanoidAlphaNumeric8char };
