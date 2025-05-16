// components/shared/header/menu.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive Additional documentation: https://github.com/auth0/nextjs-auth0
// 2025may16: when ready, enhance below to import/use the newly created lib/enhancedAuthentication/authUserVerification.ts

import { Button } from '@/components/ui/button';
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
import MenuClient from './menuClient';

export default async function Menu() {  
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
      
      <MenuClient
        profileUrl={profileUrl}
        profileImage={profileImage}
        // sessionEmail={email}
        isLoggedIn={!!session}
      />
      
    </div>
  );
}
