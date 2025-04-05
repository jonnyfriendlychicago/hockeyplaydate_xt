// this is an example route for accessing user data
// provided via https://chatgpt.com/c/67e6aad2-24c4-8010-a2b2-28bf5abb178b
// import { prisma } from '@/lib/prisma';

// export async function GET() {
//   const users = await prisma.user.findMany();
//   return Response.json(users);
// }

// above replaced by below
// ./app/api/users/route.ts

import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.authUser.findMany(); // ✅ fixed!
  return Response.json(users);
}
