// lib/incompleteUserProfileCheck.ts
// This file retired from service, replaced by overhauled syncUser.ts file

// Server-side function to check if user is missing givenName or familyName
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { syncUserFromAuth0 } from '@/lib/syncUser';

export async function incompleteUserProfileCheck() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) return false;

  const dbUser = await syncUserFromAuth0(user);
  if (!dbUser) return false;

  const profile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
    select: { givenName: true, familyName: true },
  });

  return !profile?.givenName || !profile?.familyName;
}
