// app/api/login-error/route.ts 

export const runtime = 'nodejs'; // added in attempt to resolve prod-side failing of this function. 


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { nanoidAlphaNumeric8char } from '@/lib/idGenerators/alphanumeric8char';

export async function POST(req: Request) {
  try {
    const { errorCode, email, auth0Id } = await req.json();
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

    return NextResponse.json({ presentableId: record.presentableId });
  } catch (err) {
    console.error('Failed to log login error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
