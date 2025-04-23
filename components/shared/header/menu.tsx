// components/shared/header/menu.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive Additional documentation: https://github.com/auth0/nextjs-auth0
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // for optional enhanced navigation
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
  DropdownMenuSeparator, 
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import ModeToggle from './mode-toggler';
import { auth0 } from '@/lib/auth0';
import Image from 'next/image';
import Link from 'next/link';
import profileDefault from '@/public/images/HP_logo_02_1024x1024_transp.svg';
import { prisma } from '@/lib/prisma'; 

export default async function Menu() {
  // const [open, setOpen] = useState(false);
  
  // get session user, set variables
  const session = await auth0.getSession();
  const sessionUser = session?.user; 
  const profileImage = session?.user?.picture;
  
  let profileUrl = '/profile'; // Fallback URL; don't see how this would ever be reached, but whatev

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
            <DropdownMenuContent align='end'> {/* below this line begins what's displayed */}
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem disabled>{sessionUser?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={profileUrl}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
        {/* <Sheet open={open} onOpenChange={setOpen}> */}
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start gap-4'>
            <SheetTitle>Menu</SheetTitle>

            {/* Mobile global nav  */}
            {/* <nav className='flex flex-col gap-2 text-base'>
              <Link href="/events">Events</Link>
              <Link href="/groups">Groups</Link>
              <Link href="/members">Members</Link>
              <Link href="/getting-started">Getting Started</Link>
              <Link href="/about">About</Link>
            </nav> */}
            
            <nav className='flex flex-col gap-2 text-base'>
              {['/events', '/groups', '/members', '/getting-started', '/about'].map((path) => (
                <Link key={path} href={path} >
                {/* <Link key={path} href={path} onClick={() => setOpen(false)}> */}
                  {path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Link>
              ))}
            </nav>

            <ModeToggle />

            {/* {session ? (
              <>
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
            )} */}

            {session ? (
              <div className="flex flex-col gap-2 text-base">
                <Link href={profileUrl} >
                {/* <Link href={profileUrl} onClick={() => setOpen(false)}> */}
                  Profile
                </Link>
                <a href="/auth/logout" >
                {/* <a href="/auth/logout" onClick={() => setOpen(false)}> */}
                  Logout
                </a>
                <Image
                  className='h-8 w-8 rounded-full mt-2'
                  src={profileImage || profileDefault}
                  alt='User avatar'
                  width={40}
                  height={40}
                />
              </div>
            ) : (
              <a href='/auth/login' >
              {/* <a href='/auth/login' onClick={() => setOpen(false)}> */}
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
