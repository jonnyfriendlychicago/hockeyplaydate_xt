// lib/idGenerators/createPresentableId.ts
import { prisma } from '@/lib/prisma';
import { customAlphabet } from 'nanoid';

/**
 * Generates a unique presentable ID for any supported table/field combination
 * Uses alphanumeric characters excluding vowels to avoid accidental profanity
 * @param tableName - The Prisma model name
 * @param fieldName - The field name to check for uniqueness
 * @param idCharCount - Number of characters to generate (default: 8)
 * @returns Promise<string> - The unique presentable ID
 */

export async function createPresentableId(
  // devNote: this list of supported table names needs to be maintained for any new schema entity which shall use this function.
  tableName: 'event' | 'loginFailure' | 'rsvp' | 'userProfile' | 'chapter',
  // devNote: in some cases, the fieldName is 'presentableId' but other cases include 'slug' fields, etc. 
  fieldName: string,
  // devNote: below sets a default value for number of characters, but this gets overridden by the incoming parameter
  idCharCount: number = 8
): Promise<string> {
  // 1 - establish function to be called downstream
  const generator = customAlphabet('bcdfghjkmnpqrstvwxyz2345789', idCharCount);
  
  // 2 - run the while/break on whatever table.field that parameters call for: 
  let presentableId: string;
  while (true) {
    const candidate = generator(); // run the function
    
    try {
      let existing = null;
      // the following tables.fields actually use this process
      if (tableName === 'event') {
        existing = await prisma.event.findUnique({ 
          where: { presentableId: candidate } 
        });
      } else if (tableName === 'rsvp') {
        existing = await prisma.rsvp.findUnique({ 
          where: { slug: candidate } 
        });
      // 2025aug11: the following tables.fields do not use this process, this is just for future possible implementation. 
      } else if (tableName === 'loginFailure') {
        existing = await prisma.loginFailure.findUnique({ 
          where: { presentableId: candidate } 
        });
      } else if (tableName === 'userProfile') {
        // UserProfile has multiple unique fields, use the one specified
        if (fieldName === 'slugDefault') {
          existing = await prisma.userProfile.findUnique({ where: { slugDefault: candidate } });
        } else if (fieldName === 'slugVanity') {
          existing = await prisma.userProfile.findUnique({ where: { slugVanity: candidate } });
        }
      } else if (tableName === 'chapter') {
        existing = await prisma.chapter.findUnique({ 
          where: { slug: candidate } 
        });
      }
      
      if (!existing) {
        presentableId = candidate;
        break;
      }
      
    } catch (error) {
      console.error(`Error checking uniqueness for ${tableName}.${fieldName}:`, error);
      throw new Error(`Failed to generate unique ID for ${tableName}.${fieldName}`);
    }
  }
  
  return presentableId;
}