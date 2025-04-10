// app/(root)/layout.tsx
import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { auth0 } from '@/lib/auth0'; // added to get the auth'ed user saved to db
import { syncUserFromAuth0 } from '@/lib/syncUser'; // added to get the auth'ed user saved to db

// export default function RootLayout({ // this line replaced by line below to get the auth'ed user saved to db
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // set user variables to get the auth'ed user saved to db
  const session = await auth0.getSession();
  const auth0User = session?.user; 

  // ensures DB record for user stays in sync
  if (auth0User) {
    await syncUserFromAuth0(auth0User);
  }

  // serve all parts of app
  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <main className='flex-1 wrapper'>{children}</main>
      <Footer/>
    </div>
  );
}
