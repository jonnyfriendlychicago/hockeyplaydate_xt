// app/(root)/layout.tsx
// 2025apr09: below was attempt to use layout to check if authorized user had a sufficient profile build-out (name, etc.)  This approach kept resulting in infinite page loads and was abandoned. 
import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { auth0 } from '@/lib/auth0'; // added to get the auth'ed user saved to db
import { syncUserFromAuth0 } from '@/lib/syncUser'; // added to get the auth'ed user saved to db
import { prisma } from '@/lib/prisma'; // added to enable user check + redirect
import { redirect } from 'next/navigation'; // added to enable user check + redirect
import { headers } from 'next/headers'; // added to enable user check + redirect

// export default function RootLayout({ // this line replaced by line below to get the auth'ed user saved to db
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth0.getSession(); //  added to get the auth'ed user saved to db
  const auth0User = session?.user; //  added to get the auth'ed user saved to db

  // if (auth0User) {
  //   await syncUserFromAuth0(auth0User);
  // }

  // above simple sync was replaced by below, to sync and then check for values v. redirect

  if (auth0User) {
    const dbUser = await syncUserFromAuth0(auth0User);

    if (dbUser) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: dbUser.id },
      });
      

      // if (!userProfile?.givenName || !userProfile?.familyName) {
      //   redirect('/onboarding/name');
      // }

      // above replaced by below; below checks which page on presently, and skips the redirect check inside the layout when the current route is already /onboarding/name
      // const pathname = headers().get('x-pathname'); 
      // const isOnboardingPage = pathname?.startsWith('/onboarding/name');
      // above busted, launching into infinite loop, replaced by below
      const currentPath = headers().get('x-next-url') || ''; // x-next-url is the correct header injected by Next.js that contains the actual pathname of the request.
      const isOnboardingPage = currentPath.startsWith('/onboarding/name');
      console.log("isOnboardingPage:")
      console.log(isOnboardingPage)
      // this console.log is showing: false

      if (!isOnboardingPage && (!userProfile?.givenName || !userProfile?.familyName)) {
        redirect('/onboarding/name');
      }

    }
  }

  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <main className='flex-1 wrapper'>{children}</main>
      <Footer/>
    </div>
  );
}
