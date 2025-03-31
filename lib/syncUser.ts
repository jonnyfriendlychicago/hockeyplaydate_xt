// lib/syncUser.ts
import { prisma } from './prisma';

type Auth0User = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export async function syncUserFromAuth0(user: Auth0User) {
  if (!user?.sub || !user.email) return;

  await prisma.user.upsert({
    where: { auth0Id: user.sub },
    update: {
      email: user.email,
      name: user.name ?? null,
      picture: user.picture ?? null,
    },
    create: {
      auth0Id: user.sub,
      email: user.email,
      name: user.name ?? null,
      picture: user.picture ?? null,
    },
  });
}

// original try: 
// import { UserProfile } from '@auth0/nextjs-auth0';

// // import { auth0 } from "@/lib/auth0"; // added by jrf to replace above

// import { prisma } from './prisma';

// // const UserProfile = auth0.getSession(UserProfile); 
// export async function syncUserFromAuth0(user: UserProfile) {
//   if (!user?.sub || !user.email) return;

//   await prisma.user.upsert({
//     where: { auth0Id: user.sub },
//     update: {
//       email: user.email,
//       name: user.name ?? null,
//       picture: user.picture ?? null,
//     },
//     create: {
//       auth0Id: user.sub,
//       email: user.email,
//       name: user.name ?? null,
//       picture: user.picture ?? null,
//     },
//   });
// }
