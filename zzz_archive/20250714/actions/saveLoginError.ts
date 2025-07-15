// lib/actions/saveLoginError.ts
'use server'
 // 101: 
//  Why 'use server' is needed... Next.js 13+ App Router logic:

// Components are server-side by default (unless you add 'use client')
// Server Actions need explicit 'use server' directive to be callable from client components or other server contexts

//  'use server' marks the function as a Server Action - can be called from anywhere (client or server); Guarantees server-side execution - even if called from client code
// Enables special Next.js optimizations - like automatic serialization, caching, etc.

// Without 'use server':
// The function would just be a regular server-side function that can only be imported and called from other server-side code.

import { prisma } from '@/lib/prisma';
import { nanoidAlphaNumeric8char } from '@/lib/idGenerators/alphanumeric8char';

export async function saveLoginError(errorCode: string, email: string, auth0Id: string) {
  try {
    // Generate unique presentableId
    let presentableId: string;
    while (true) {
      const candidate = nanoidAlphaNumeric8char();
      const existing = await prisma.loginFailure.findUnique({
        where: { presentableId: candidate },
      });
      if (!existing) {
        presentableId = candidate;
        break;
      }
    }

    const record = await prisma.loginFailure.create({
      data: {
        presentableId,
        errorCode,
        email,
        auth0Id,
      },
    });

    return { success: true, presentableId: record.presentableId };
  } catch (error) {
    console.error('Server action error:', error);
    return { success: false, error: 'Database error' };
  }
}