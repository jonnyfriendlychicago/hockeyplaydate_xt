// app/api/members/route.ts
// this function called by: app/(root)/members/page.tsx
export const dynamic = 'force-dynamic'; // force fresh fetch on every request; this (along with updated return below) ensures not displaying outdated data
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      authUser: true,
    },
  });

  return NextResponse.json(profiles
    // begin: this (along with export above) ensures not displaying outdated data
    , {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
    // begin: this (along with export above) ensures not displaying outdated data

  );
}
