// lib/syncUser.ts
import { prisma } from './prisma';
import { nanoid } from 'nanoid';

// Why this works (instead of prev version)
// - slug is definitely assigned before being used
// - TypeScript is happy because the return only occurs after a valid value is assigned

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

export async function syncUserFromAuth0(returnedA0userObj: Auth0User) {
  if (!returnedA0userObj?.sub || !returnedA0userObj.email) return;

  const dbUser = await prisma.authUser.upsert({
    where: { auth0Id: returnedA0userObj.sub },
    update: {
      email: returnedA0userObj.email,
      emailVerified: returnedA0userObj.email_verified ?? false, // 101: The ?? operator is the nullish coalescing operator. It returns the right-hand value only if the left-hand value is null or undefined.
      name: returnedA0userObj.name ?? null,
      givenName: returnedA0userObj.given_name ?? null,
      familyName: returnedA0userObj.family_name ?? null,
      nickname: returnedA0userObj.nickname ?? null,
      picture: returnedA0userObj.picture ?? null,
    },
    create: {
      auth0Id: returnedA0userObj.sub,
      email: returnedA0userObj.email,
      emailVerified: returnedA0userObj.email_verified ?? false,
      name: returnedA0userObj.name ?? null,
      givenName: returnedA0userObj.given_name ?? null,
      familyName: returnedA0userObj.family_name ?? null,
      nickname: returnedA0userObj.nickname ?? null,
      picture: returnedA0userObj.picture ?? null,
    },
  });

  // check: does userProfile record exist for this authUser record?  (it might not yet, if first login ever, b/c such was just upserted above)
  const existingProfile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
  });
  // if not, create it! 
  if (!existingProfile) {
    const slug = await generateUniqueSlug();

    await prisma.userProfile.create({
      data: {
        userId: dbUser.id,
        slugDefault: slug,
        givenName: returnedA0userObj.given_name ?? null,  // populate from authUser record (same as returned object), if value there
        familyName: returnedA0userObj.family_name ?? null, // populate from authUser record (same as returned object), if value there
        // 101: in context of above, || returns the right-hand side if the left is falsy (like "", 0, false, null, undefined), while ?? returns the right-hand side only if the left is null or undefined
      },
    });
  }

  return dbUser; // added this return, to enable 
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

