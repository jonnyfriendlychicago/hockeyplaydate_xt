// app/api/members/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const profiles = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      authUser: true, // updated to match your new relation name
    },
  });

  return NextResponse.json(profiles);
}
