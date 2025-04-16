// app/(root)/member/edit/page.tsx
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import EditProfileForm from '@/components/UserProfile/EditProfileForm';
import { redirect } from 'next/navigation';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';

export default async function EditProfilePage() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) redirect('/auth/login');

  const dbUser = await prisma.authUser.findUnique({
    where: { auth0Id: user.sub },
  });

  if (!dbUser) redirect('/auth/login');

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: dbUser.id },
  });

  if (!userProfile) redirect('/');

  const displayName =
    `${userProfile.givenName ?? ''} ${userProfile.familyName ?? ''}`.trim() ||
    dbUser.email ||
    'Nameless User';
  
  const sluggy= userProfile.slugVanity || userProfile.slugDefault

  // Normalize nullable fields for prop shape compliance, i.e. empty strings v. nulls
  const normalizedProfile = {
    ...userProfile,
    altNickname: userProfile.altNickname ?? '',
    givenName: userProfile.givenName ?? '',
    familyName: userProfile.familyName ?? '',
    altEmail: userProfile.altEmail ?? '',
    phone: userProfile.phone ?? '',
  };

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">

        <div className="flex justify-end">
          <Link href={`/member/${sluggy}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
              <CircleX className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
        </div>


      {/* Top Grid: Avatar + Placeholder (non-editable) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Avatar */}
        <div className="col-span-2 flex flex-col items-center justify-center gap-4">
          <UserAvatar
            src={dbUser.picture}
            fallback="A"
            size="xl"
            className="ring-2 ring-gray-400 shadow-lg"
            altProp={displayName}
          />
        </div>

        {/* Right: Placeholder */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm font-semibold">[Coming Soon]</p>
              <p className="text-sm">Add your family photo and short blurb here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Editable Form */}
      <div className="w-full">
        <EditProfileForm userProfile={normalizedProfile} slug={sluggy} />
      </div>
    </section>
  );
}


// 2025apr12 6pm

// // app/(root)/member/edit/page.tsx
// import { auth0 } from '@/lib/auth0';
// import { prisma } from '@/lib/prisma';
// import EditProfileForm from '@/components/UserProfile/EditProfileForm';
// import { redirect } from 'next/navigation';
// import { UserAvatar } from '@/components/shared/user-avatar';
// import { Card, CardContent } from '@/components/ui/card';

// export default async function EditProfilePage() {
//   const session = await auth0.getSession();
//   const user = session?.user;

//   if (!user) redirect('/auth/login');

//   const dbUser = await prisma.authUser.findUnique({
//     where: { auth0Id: user.sub },
//   });

//   if (!dbUser) redirect('/auth/login');

//   const userProfile = await prisma.userProfile.findUnique({
//     where: { userId: dbUser.id },
//   });

//   if (!userProfile) redirect('/');

//   const displayName =
//     `${userProfile.givenName ?? ''} ${userProfile.familyName ?? ''}`.trim() ||
//     dbUser.email ||
//     'Nameless User';

//   return (
//     <section className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Top Grid: Avatar + Placeholder (non-editable) */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
//         {/* Left: Avatar */}
//         <div className="col-span-2 flex flex-col items-center justify-center gap-4">
//           <UserAvatar
//             src={dbUser.picture}
//             fallback="A"
//             size="xl"
//             className="ring-2 ring-gray-400 shadow-lg"
//             altProp={displayName}
//           />
//         </div>

//         {/* Right: Placeholder */}
//         <div className="col-span-3">
//           <Card className="h-full">
//             <CardContent className="p-6 h-full flex items-center justify-center text-center text-muted-foreground">
//               <p className="text-sm">[Coming Soon]</p>
//               <p className="text-sm">Add your family photo and short blurb here</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Bottom Row: Editable Form in "Contact" Card */}
//       <div className="w-full">
//         <Card  >
//           <CardContent className="p-6 space-y-6">
//             {/* <h3 className="text-lg font-semibold">Contact</h3> */}
//             <EditProfileForm userProfile={userProfile} />
//           </CardContent>
//         </Card>
//       </div>
//     </section>
//   );
// }


// 2025apr12: below replaced by above 

// app/(root)/member/edit/page.tsx
// import { auth0 } from '@/lib/auth0';
// import { prisma } from '@/lib/prisma';
// import EditProfileForm from '@/components/UserProfile/EditProfileForm';
// import { redirect } from 'next/navigation';

// export default async function EditProfilePage() {
//   const session = await auth0.getSession();
//   const user = session?.user;

//   // Require login
//   if (!user) {
//     redirect('/auth/login');
//   }

//   // Find matching AuthUser
//   const dbUser = await prisma.authUser.findUnique({
//     where: { auth0Id: user.sub },
//   });

//   if (!dbUser) {
//     redirect('/auth/login'); // or show error page
//   }

//   // Get the user's current profile
//   const userProfile = await prisma.userProfile.findUnique({
//     where: { userId: dbUser.id },
//   });

//   if (!userProfile) {
//     redirect('/'); // No profile — fallback handling
//   }

//   // Pass profile data to form
//   return (
//     <section className="max-w-xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
//       <EditProfileForm userProfile={userProfile} />
//     </section>
//   );
// }
