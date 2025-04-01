import Header from '@/components/shared/header';
import Footer from '@/components/footer';
// below added to get the auth'ed user saved to db
import { auth0 } from '@/lib/auth0';
import { syncUserFromAuth0 } from '@/lib/syncUser';

// export default function RootLayout({
// above replaced by below to get the auth'ed user saved to db
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // below added to get the auth'ed user saved to db
  const session = await auth0.getSession();
  const auth0User = session?.user;

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
