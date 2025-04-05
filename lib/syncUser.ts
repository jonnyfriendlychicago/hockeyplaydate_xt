// lib/syncUser.ts
import { prisma } from './prisma';
import { nanoid } from 'nanoid';

// Why this works (instead of prev version)
// - slug is definitely assigned before being used
// - TypeScript is happy because the return only occurs after a valid value is assigned
// - Logic stays clean and exactly what you want

type Auth0User = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
};

async function generateUniqueSlug(): Promise<string> {
  let slug: string;

  do {
    slug = nanoid(8);

    const existing = await prisma.userProfile.findFirst({
      where: {
        OR: [
          { slugDefault: slug },
          { slugVanity: slug },
        ],
      },
    });

    if (!existing) {
      return slug;
    }
  } while (true);
}

export async function syncUserFromAuth0(user: Auth0User) {
  if (!user?.sub || !user.email) return;

  const dbUser = await prisma.authUser.upsert({
    where: { auth0Id: user.sub },
    update: {
      email: user.email,
      emailVerified: user.email_verified ?? false,
      name: user.name ?? null,
      givenName: user.given_name ?? null,
      familyName: user.family_name ?? null,
      nickname: user.nickname ?? null,
      picture: user.picture ?? null,
    },
    create: {
      auth0Id: user.sub,
      email: user.email,
      emailVerified: user.email_verified ?? false,
      name: user.name ?? null,
      givenName: user.given_name ?? null,
      familyName: user.family_name ?? null,
      nickname: user.nickname ?? null,
      picture: user.picture ?? null,
    },
  });

  const existingProfile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
  });

  if (!existingProfile) {
    const slug = await generateUniqueSlug();

    await prisma.userProfile.create({
      data: {
        userId: dbUser.id,
        slugDefault: slug,
      },
    });
  }
}


// below replaced by above

// lib/syncUser.ts
// import { prisma } from './prisma';
// import { nanoid } from 'nanoid';

// type Auth0User = {
//   sub: string;
//   // email: string;
//   email?: string;
//   email_verified?: boolean;
//   name?: string;
//   given_name?: string;
//   family_name?: string;
//   nickname?: string;
//   picture?: string;
// };

// async function generateUniqueSlug(): Promise<string> {
//   let slug: string;
//   let isUnique = false;

//   while (!isUnique) {
//     slug = nanoid(8);

//     const existing = await prisma.userProfile.findFirst({
//       where: {
//         OR: [
//           { slugDefault: slug },
//           { slugVanity: slug },
//         ],
//       },
//     });

//     if (!existing) {
//       isUnique = true;
//     }
//   }

//   return slug;
//   // red squiggle error on slug in line above: "Variable 'slug' is used before being assigned.ts(2454)"
// }

// export async function syncUserFromAuth0(user: Auth0User) {
//   if (!user?.sub || !user.email) return;

//   const dbUser = await prisma.authUser.upsert({
//     where: { auth0Id: user.sub },
//     update: {
//       email: user.email,
//       emailVerified: user.email_verified ?? false,
//       name: user.name ?? null,
//       givenName: user.given_name ?? null,
//       familyName: user.family_name ?? null,
//       nickname: user.nickname ?? null,
//       picture: user.picture ?? null,
//     },
//     create: {
//       auth0Id: user.sub,
//       email: user.email,
//       emailVerified: user.email_verified ?? false,
//       name: user.name ?? null,
//       givenName: user.given_name ?? null,
//       familyName: user.family_name ?? null,
//       nickname: user.nickname ?? null,
//       picture: user.picture ?? null,
//     },
//   });

//   const existingProfile = await prisma.userProfile.findUnique({
//     where: { userId: dbUser.id },
//   });

//   if (!existingProfile) {
//     const slug = await generateUniqueSlug();
//     // const sluggy = await generateUniqueSlug(); // this didn't fix anything. 

//     await prisma.userProfile.create({
//       data: {
//         userId: dbUser.id,
//         slugDefault: slug,
//         // slugDefault: sluggy, // this didn't fix anything. 
//       },
//     });
//   }
// }


// below commOUT was orig using 'user' entity.  replaced by all of above.  2025-apr-03

// import { prisma } from './prisma';
// type Auth0User = {
//   sub: string;
//   email?: string;
//   name?: string;
//   picture?: string;
// };

// export async function syncUserFromAuth0(user: Auth0User) {
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

