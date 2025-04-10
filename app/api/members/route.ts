// app/api/members/route.ts
// this function called by: app/(root)/members/page.tsx
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      authUser: true,
    },
  });

  return NextResponse.json(profiles);
}
