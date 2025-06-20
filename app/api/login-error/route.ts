// app/api/login-failure/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { customAlphabet } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { errorCode, email, auth0Id } = await req.json();

    const nanoidAlphaNumeric = customAlphabet('bcdfghjklmnpqrstvwxyz0123456789', 8); 
    // Generate unique presentableId
    let presentableId: string;
    while (true) {
      const candidate = nanoidAlphaNumeric();
      
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
