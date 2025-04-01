// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  process.env.NODE_ENV === 'production'
    ? new PrismaClient()
    : globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient());

// above is Recommended Universal prisma.ts File; below was former version, pieced together, not ideal

// // FOR DEV: This avoids Prisma throwing “Too many instances” during hot-reloading in development.
// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ?? new PrismaClient();

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }

// // FOR PROD: Your lib/prisma.ts should already guard against multiple instances (see earlier example), but in production you can simplify it too:
// // import { PrismaClient } from '@prisma/client';
// // export const prisma = new PrismaClient();
