// components/shared/header/menu.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive Additional documentation: https://github.com/auth0/nextjs-auth0
import { EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ModeToggle from './mode-toggler';
import { auth0 } from '@/lib/auth0';
import Image from 'next/image';
import Link from 'next/link';
import profileDefault from '@/public/images/HP_logo_02_1024x1024_transp.svg';
import { prisma } from '@/lib/prisma'; //  Add this line to your imports

export default async function Menu() {
  // get session user, set variables
  const session = await auth0.getSession();
  const profileImage = session?.user?.picture;
  
  let profileUrl = '/profile'; // Fallback URL

  if (session?.user?.sub) {
    const authUser = await prisma.authUser.findUnique({
      where: { auth0Id: session.user.sub },
      include: { userProfile: true },
    });

    const slug = authUser?.userProfile?.slugVanity || authUser?.userProfile?.slugDefault;

    if (slug) {
      profileUrl = `/member/${slug}`;
    }
  }

  return (
    <div className='flex justify-end gap-3 items-center'>
      {/* Desktop view */}
      <div className='hidden md:flex items-center gap-3'>
        <ModeToggle />

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className='flex items-center gap-2 cursor-pointer'>
                <Image
                  className='h-8 w-8 rounded-full'
                  src={profileImage || profileDefault}
                  alt='User avatar'
                  width={40}
                  height={40}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href='/profile'>ol-Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={profileUrl}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href='/auth/logout'>Logout</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <a href='/auth/login'> 
            <Button>Sign in / Sign Up</Button>
          </a>
        )}
      </div>

      {/* Mobile view */}
      <div className='md:hidden'>
        <Sheet>
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start gap-4'>
            <SheetTitle>Menu</SheetTitle>

            {/* Mobile global nav (optional) */}
            <nav className='flex flex-col gap-2 text-base'>
              <Link href="/events">Events</Link>
              <Link href="/groups">Groups</Link>
              <Link href="/members">Members</Link>
              <Link href="/getting-started">Getting Started</Link>
              <Link href="/about">About</Link>
            </nav>

            <ModeToggle />

            {session ? (
              <>
                <Link href='/profile'>
                  <Button variant='ghost'>ol-Profile</Button>
                </Link>
                <Link href={profileUrl}>
                  <Button variant='ghost'>Profile</Button>
                </Link>
                <a href='/auth/logout'>
                  <Button variant='ghost'>Logout</Button>
                </a>
                <Image
                  className='h-8 w-8 rounded-full mt-2'
                  src={profileImage || profileDefault}
                  alt='User avatar'
                  width={40}
                  height={40}
                />
              </>
            ) : (
              <a href='/auth/login'>
                <Button>Sign in</Button>
              </a>
            )}

            <SheetDescription />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
