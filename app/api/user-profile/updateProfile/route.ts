// app/api/user-profile/updateProfile/route.ts

import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { userProfileValSchema } from '@/lib/validation/userProfileValSchema';
import { ZodError } from 'zod';


export async function POST(req: Request) {
  const session = await auth0.getSession();
  const sessionUser = session?.user;

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: sessionUser.sub },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

// Server-side validation with Zod
let parsed;
  try {
    const body = await req.json();
    parsed = userProfileValSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  // Sanitize nullable fields
  const payload = {
    ...parsed,
    slugVanity: parsed.slugVanity?.trim() || null,
    altNickname: parsed.altNickname?.trim() || null,
    altEmail: parsed.altEmail?.trim() || null,
    phone: parsed.phone?.trim() || null,
  };
  
  
  const updated = await prisma.userProfile.update({
    where: { userId: dbUser.id },
    data: payload,
    select: {
      slugDefault: true,
      slugVanity: true,
    },
  });
  
  return NextResponse.json(updated);
}



  // ensure string of spaces definitely converted to null.  Essential to have this handled on back-end / route.ts
  // const sanitizedSlugVanity =
  // typeof slugVanity === 'string' && slugVanity.trim() !== '' ? slugVanity.trim() : null;

 // const { 
  //   altEmail, 
  //   phone, 
  //   slugVanity, 
  //   givenName, 
  //   familyName, 
  //   altNickname,
  // } = await req.json();

  // above replaced by below

  // Server-side validation with Zod
//   let data;
//   try {
//     const body = await req.json();
//     data = userProfileValSchema.parse(body);
//   } catch (err) {
//     return NextResponse.json(
//       // { error: 'Validation failed', 
//       //   details: error }, 

// // above replaced by below
// {
//   error: 'Validation failed',
//   issues: err.issues.map((issue) => ({
//     field: issue.path.join('.'),
//     message: issue.message,
//   })),
// },

//         { status: 400 }
//     );
//   }



  // const updated = await prisma.userProfile.update({
  //   where: { userId: dbUser.id },
  //   data: {
    //     altEmail,
    //     phone,
    //     // slugVanity,
    //     slugVanity: sanitizedSlugVanity,
    //     givenName,
    //     familyName,
    //     altNickname,
    //   },
    //   // above replaced by below
    //   // data: payload,
    
    //   select: { // this object added: ensures these fields are returned in the update, even tho slugDefault isn't being touched. This ensures that attribute is accessible on the originating form/page. 
    //     slugDefault: true, 
    //     slugVanity: true
    //   }
  // });