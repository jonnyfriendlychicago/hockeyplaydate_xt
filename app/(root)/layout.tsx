// app/(root)/layout.tsx
import Header from '@/components/shared/header';
import Footer from '@/components/footer';
import { auth0 } from '@/lib/auth0'; // added to get the auth'ed user saved to db
import { syncUserFromAuth0 } from '@/lib/syncUser'; // added to get the auth'ed user saved to db

// export default function RootLayout({
// line above replaced by line below to get the auth'ed user saved to db
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth0.getSession(); //  added to get the auth'ed user saved to db
  const auth0User = session?.user; //  added to get the auth'ed user saved to db

  if (auth0User) {
    await syncUserFromAuth0(auth0User);
  }

  return (
    <div className='flex h-screen flex-col'>
      <Header />
      <main className='flex-1 wrapper'>{children}</main>
      <Footer/>
    </div>
  );
}
