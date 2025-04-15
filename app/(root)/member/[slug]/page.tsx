// app/(root)/member/[slug]/page.tsx

export const dynamic = 'force-dynamic';
// 101: This server-side page, by default, doesn't refresh data when its been visited just recently.  
// Result is that upon routing here from edit form, the page will display with cached (and now stale) data.
// Above disables caching and should force the server to re-fetch fresh data on each navigation to this page.  
// BUT, that's not happening actually b/c force-dynamic only applies to server-side rendering, not to client-side router state. 
// Keep this here, however, because it works on first navigation or reload.
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Pencil } from 'lucide-react';
import { auth0 } from '@/lib/auth0';

export default async function MemberPage({ params }: { params: { slug: string } }) {
  const session = await auth0.getSession();
  const sessionUser = session?.user;

  const profile = await prisma.userProfile.findFirst({
    where: {
      OR: [
        { slugVanity: params.slug },
        { slugDefault: params.slug },
      ],
    },
    include: {
      authUser: true,
    },
  });

  if (!profile) notFound();

  const { authUser, altEmail, phone } = profile;

  const displayName =
    `${profile.givenName ?? ''} ${profile.familyName ?? ''}`.trim() ||
    authUser.email ||
    'Nameless User';

  const isSessionUserProfile = sessionUser?.sub === authUser.auth0Id;

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Edit Icon Top-Right */}
      {isSessionUserProfile && (
        <div className="flex justify-end">
          <Link href="/member/edit">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        </div>
      )}

      {/* Family Display Name (altNickname as brand/hero) */}
      {profile.altNickname && (
        <>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            {profile.altNickname}
          </h1>
        </div>

      </>
      )}

      {!profile.altNickname && isSessionUserProfile && (
        <>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            [PLACEHOLDER FOR YOUR FAMILY BRAND!]
          </h1>
          <p className="text-sm text-muted-foreground">Only you are seeing above placeholder.  Click 'edit', then enter/save your Family Brand Name.  Then it will appear to users in the space above. </p>
        </div>

      </>
      )}

      {/* Top Row: Avatar + Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Name + Avatar */}
        <div className="col-span-2 flex flex-col items-center justify-center gap-4">
          <UserAvatar
            src={authUser.picture}
            fallback="A"
            size="xl"
            className="ring-2 ring-gray-400 shadow-lg"
            altProp={displayName}
          />
          <h2 className="text-2xl font-bold text-center">{displayName}</h2>
        </div>

        {/* Right: Placeholder Card for Future Feature */}
        <div className="col-span-3">
          <Card className="h-full">
           
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-semibold">[Coming Soon]</p>
              <p className="text-sm">Add your family photo and short blurb here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Full-width Contact Info Card */}
      <div className="w-full">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex flex-col md:flex-row md:items-center md:gap-12 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">
                {altEmail ? altEmail : authUser.email}
                </p>
      {/* Show login hint only to the session user, only if login != altEmail */}
      {(sessionUser?.sub === authUser.auth0Id &&
        altEmail &&
        altEmail !== authUser.email) && (
            <p>
              <span className="ml-0 text-sm text-muted-foreground italic">(NOTE: above is the email that you have selected to display to other Hockey Playdate members as your preferred email address.  This is different from the non-displayed email you use to login to this site (HockeyPlaydate.com): {authUser.email})
              </span>
            </p>
      )}
              </div>
              {/* {altEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">Alt Email</p>
                  <p className="font-medium">{altEmail}</p>
                </div>
              )} */}
              {phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


// 2025apr11: jrf hack-up of chat's original

// app/(root)/member/[slug]/page.tsx
// import { prisma } from '@/lib/prisma';
// import { notFound } from 'next/navigation';
// import Link from 'next/link';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// // import { Badge } from '@/components/ui/badge'; // required prerequisite: npx shadcn@latest add badge   
// import { UserAvatar } from '@/components/shared/user-avatar';
// import { Pencil } from 'lucide-react'; // required prerequisite: npm install lucide-react
// import { auth0 } from '@/lib/auth0';

// export default async function MemberPage({ params }: { params: { slug: string } }) {
//   const session = await auth0.getSession();
//   const sessionUser = session?.user;

//   const profile = await prisma.userProfile.findFirst({
//     where: {
//       OR: [
//         { slugVanity: params.slug },
//         { slugDefault: params.slug },
//       ],
//     },
//     include: {
//       authUser: true,
//     },
//   });

//   if (!profile) notFound();

//   const {
//     authUser,
//     altEmail,
//     phone,
//   } = profile;

//   const displayName = `${profile.givenName ?? ''} ${profile.familyName ?? ''}`.trim() || authUser.email || 'Nameless User';

//   const showEditIcon = sessionUser?.sub === authUser.auth0Id;

//   return (
//     <section className="max-w-6xl mx-auto p-6">
//       {/* Edit Icon Top-Right */}
//       {showEditIcon && (
//         <div className="flex justify-end mb-4">
//           <Link href="/member/edit">
//             <Button variant="ghost" size="icon" className="hover:bg-muted">
//               <Pencil className="w-5 h-5" />
//               <span className="sr-only">Edit Profile</span>
//             </Button>
//           </Link>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//         {/* Left: Avatar + Name */}
//         <div className="col-span-2 flex flex-col items-center gap-4">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold">{displayName}</h2>
//           </div>
//           <UserAvatar
//             src={authUser.picture}
//             fallback="A"
//             size="xl"
//             className="ring-2 ring-gray-400 shadow-lg"
//             altProp={displayName}
//           />

//         </div>

//         {/* Middle: Contact Info in a Card */}
//         <div className="col-span-3">
//           <Card>
//             <CardContent className="p-6 space-y-4">
//               <h1>coming soon... Add your family photo here</h1>
//             </CardContent>
//           </Card>
//         </div>

       
//       </div>

//       <div className="flex mt-4">

//           <Card>
//             <CardContent className="p-6 space-y-4">
//               <div>
//                 <p className="text-sm text-muted-foreground">Email</p>
//                 <p className="font-medium">{authUser.email}</p>
//               </div>
//               {altEmail && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Alt Email</p>
//                   <p className="font-medium">{altEmail}</p>
//                 </div>
//               )}
//               {phone && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Phone</p>
//                   <p className="font-medium">{phone}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
        


//     </section>
//   );
// }



// 2025apr11: above replaces all of below
// app/(root)/member/[slug]/page.tsx

// import { prisma } from '@/lib/prisma';
// import { notFound } from 'next/navigation';
// import Link from 'next/link';
// import { Card, CardContent } from '@/components/ui/card'; // required prerequisite: npx shadcn@latest add card   
// import { Badge } from '@/components/ui/badge'; // required prerequisite: npx shadcn@latest add badge   
// import { Button } from '@/components/ui/button'; // required prerequisite: npx shadcn@latest add button   
// import { UserAvatar } from '@/components/shared/user-avatar'; // required prerequisite: npx shadcn@latest add UserAvatar   
// import { auth0 } from '@/lib/auth0'; // get authenticated user object

// export default async function MemberPage({ params }: { params: { slug: string } }) {
//   const session = await auth0.getSession();
//   const sessionUser = session?.user;

//   const profile = await prisma.userProfile.findFirst({
//     where: {
//       OR: [
//         { slugVanity: params.slug },
//         { slugDefault: params.slug },
//       ],
//     },
//     include: {
//       authUser: true,
//     },
//   });

//   if (!profile) notFound();

//   const {
//     authUser,
//     altEmail,
//     // altNickname,
//     phone,
//     // slugDefault,
//     // slugVanity,
//     // givenName, 
//     // familyName
//   } = profile;

//   const displayName =`${profile.givenName ?? ''} ${profile.familyName ?? ''}`.trim() || profile.authUser.email || 'Nameless Emailless User';
//   // const displaySlug = slugVanity || slugDefault;

//   return (
//     <section className="max-w-6xl mx-auto p-6">
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//         {/* Profile Pic */}
//         <div className="col-span-2 flex flex-col items-center gap-4">

//           <UserAvatar
//             src={authUser.picture}
//             fallback="A"
//             // size="lg"
//             size="xl"
//             className=' ring-2 ring-gray-400 shadow-lg'
//             altProp={displayName}
//           />

//           <div className="text-center">
//             <h1 className="text-2xl font-bold">{displayName}</h1>
//             {/* <p className="text-muted-foreground text-sm font-mono">{displaySlug}</p> */}
//             {/* {altNickname && <p className="italic text-muted-foreground text-sm">“Also known as {altNickname}”</p>} */}
//           </div>
//         </div>

//         {/* Contact Info */}
//         <div className="col-span-2 space-y-4 p-2">
//           <div>
//             <p className="text-sm text-muted-foreground">Email</p>
//             <p className="font-medium">{authUser.email}</p> 
//           </div>
//           {altEmail && (
//             <div>
//               <p className="text-sm text-muted-foreground">Alt Email</p>
//               <p className="font-medium">{altEmail}</p>
//             </div>
//           )}
//           {phone && (
//             <div>
//               <p className="text-sm text-muted-foreground">Phone</p>
//               <p className="font-medium">{phone}</p>
//             </div>
//           )}
//         </div>

//         {/* Sidebar Card */}
//         <div className="col-span-1">

//         {sessionUser?.sub === profile.authUser.auth0Id && (
//           <Link href="/member/edit">
//             <Button className="mt-4">Edit My Profile</Button>
//           </Link>
//         )}

//           <Card>
//             <CardContent className="p-4 space-y-4">
//               <div className="flex justify-between">
//                 <span>Status</span>
//                 <Badge variant="default">Active</Badge>
//               </div>
//               <div className="flex justify-between">
//                 <span>Profile Type</span>
//                 <Badge variant="secondary">Member</Badge>
//               </div>
//               <Button className="w-full">Connect</Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </section>
//   );
// }
