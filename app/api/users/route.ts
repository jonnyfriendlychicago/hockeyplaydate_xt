// this is an example route for accessing user data; this route is not used as of 2025may05

import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.authUser.findMany(); 
  return Response.json(users);
}
