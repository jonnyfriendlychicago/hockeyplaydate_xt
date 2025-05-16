// app/(root)/layout.tsx

import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { auth0 } from '@/lib/auth0'; // added to get the auth'ed user saved to db
import { syncUserFromAuth0 } from '@/lib/syncUser'; // added to get the auth'ed user saved to db
// import { EditUserProfileNameForm } from '@/components/UserProfile/EditUserProfileNameForm'; // this moved to component of component
// import { headers } from 'next/headers'; // this doesn't work; pathname instead
// import { usePathname } from 'next/navigation'; // needed for embedded client logic // and this doesn't work either!
// import { Suspense } from 'react'; // and this doesn't work either!
import { UserProfileNameGate } from '@/components/UserProfile/UserProfileNameGate';

// import { Toaster } from "@/components/ui/toaster" // npx shadcn@latest add toast // ALSO: toast is more complex than many other simple shadCN components, read more: https://ui.shadcn.com/docs/components/toast

// // Inline client-only wrapper ... and this doesn't work at all
// function UserProfileNameGate({
//   givenName,
//   familyName,
// }: {
//   givenName: string | null | undefined;
//   familyName: string | null | undefined;
// }) {
//   'use client';
//   const pathname = usePathname();

//   const suppress =
//     pathname.startsWith('/member/edit') ||
//     pathname.startsWith('/member/edit-backend-test');

//   if (suppress) return null;

//   return (
//     <EditUserProfileNameForm
//       givenName={givenName}
//       familyName={familyName}
//     />
//   );
// }

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // set current user variables 
  const authSession = await auth0.getSession();
  const authSessionUser = authSession?.user; //  formerly: const auth0User = session?.user; ... and this was easily confused with actual entity authUser / auth_user; 

  const userProfile = authSessionUser? await syncUserFromAuth0(authSessionUser) : null; // runs the sync every login, AND get user profile from sync
  // 101: above ternary could also be written as traditional 'if' syntax: 
  // let userProfile = null; if (auth0User) {userProfile = await syncUserFromAuth0(auth0User);}
  
  const profileMinimallyInsufficient = !!authSessionUser && (!userProfile?.givenName || !userProfile?.familyName); // determine if the users profile doesn't meet minimal biz goals
  // 101: The !! (double bang) above is a JavaScript trick to coerce any value into a boolean:
  // The first ! negates the value (e.g. turns truthy → false, or falsy → true)
  // The second ! negates it again, flipping it back — but now it's guaranteed to be a boolean (true or false)
  // Using !! ensures that the left-hand value is strictly boolean, which makes the whole expression return true or false as expected.

  // determine current path from request headers
  // this doesn't work; pathname instead
  // const currentPath = headers().get('x-invoke-path') || ''; 
  // const suppressNameForm = currentPath.includes('/member/edit') || currentPath.includes('/member/edit-backend-test'); 
  
  return (
    <div className='flex h-screen flex-col'>
      <Header />
      {/* {profileMinimallyInsufficient && !suppressNameForm && <EditUserProfileNameForm givenName={userProfile?.givenName} familyName={userProfile?.familyName} />} */}
     
      {/* {profileMinimallyInsufficient && ( // ... and none of this works
      <Suspense>
        <UserProfileNameGate
            givenName={userProfile?.givenName}
            familyName={userProfile?.familyName}
        />
      </Suspense>
      )} */}

      {profileMinimallyInsufficient && (
        <UserProfileNameGate
          givenName={userProfile?.givenName}
          familyName={userProfile?.familyName}
        />
      )}

      <main className='flex-1 wrapper'>{children}</main>
      <Footer/>
      {/* <Toaster /> */}
    </div>
  );
}
