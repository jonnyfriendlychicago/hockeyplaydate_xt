// // lib/loginFailure.ts

// // import { prisma } from '@/lib/db'; // adjust path if needed
// import { prisma } from '@/lib/prisma';
// import { customAlphabet } from 'nanoid';

// const nanoidAlphaNumeric = customAlphabet('bcdfghjklmnpqrstvwxyz0123456789', 8); // consonants + digits

// export async function generateUniquePresentableId(): Promise<string> {
//   while (true) {
//     const candidate = nanoidAlphaNumeric();
//     const existing = await prisma.loginFailure.findUnique({
//       where: { presentableId: candidate },
//     });
//     if (!existing) return candidate;
//   }
// }

// export async function saveLoginFailure(params: {
//   errorCode: string;
//   email?: string;
//   auth0Id?: string;
// }) {
//   const presentableId = await generateUniquePresentableId();

//   const record = await prisma.loginFailure.create({
//     data: {
//       presentableId,
//       errorCode: params.errorCode,
//       email: params.email ?? null,
//       auth0Id: params.auth0Id ?? null,
//     },
//   });

//   return record;
// }
