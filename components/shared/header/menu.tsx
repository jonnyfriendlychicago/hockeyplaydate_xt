// components/shared/header/menu.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive Additional documentation: https://github.com/auth0/nextjs-auth0

import { Button } from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,DropdownMenuSeparator, DropdownMenuLabel} from '@/components/ui/dropdown-menu';
import ModeToggle from './mode-toggler';
import { auth0 } from '@/lib/auth0';
import Image from 'next/image';
import Link from 'next/link';
import profileDefault from '@/public/images/HP_logo_02_1024x1024_transp.svg';
import { prisma } from '@/lib/prisma'; 
import MenuClient from './menuClient';

export default async function Menu() {  
  
  // 0 - authenticate user
  // note: this component can't readily use lib/enhancedAuthentication/authUserVerification.ts, b/c that file has various redirects
  // so, decent amount of logic/code repeated here. 2025jul29: doens't seem worth refactoring to adjust. 
  const authSession = await auth0.getSession();
  const authSessionUser = authSession?.user; 
  const profileImage = authSession?.user?.picture;
  
  // 1 - declare downstream vars, which potentially get updated in next step
  let profileUrl = '/profile'; 
  let dupeAuthUser = false; 

  // 2 - get full user object from database, set essential vars
  if (authSession?.user?.sub) {
    const dbAuthUser = await prisma.authUser.findUnique({
      where: { auth0Id: authSession.user.sub },
      include: { userProfile: true },
    });

    const slug = dbAuthUser?.userProfile?.slugVanity || dbAuthUser?.userProfile?.slugDefault;

    if (slug) {
      profileUrl = `/member/${slug}`;
    }

    if (dbAuthUser?.duplicateOfId) {
      dupeAuthUser = true; 
    }
  }

  // 3 - return it all
  return (
    <div className='flex justify-end gap-3 items-center'>
      {/* Desktop view */}
      <div className='hidden md:flex items-center gap-3'>
        <ModeToggle />

        {authSession ? (
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
              
              <DropdownMenuItem disabled>{authSessionUser?.email}</DropdownMenuItem>
              
              <DropdownMenuSeparator />  
              
             {dupeAuthUser ? (
              <>
              </>
             ) : (
             <>
             <DropdownMenuItem asChild>
                <Link href={profileUrl}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              </>) } 
              
              <DropdownMenuItem asChild>
                <a href='/auth/logout'>Logout</a>
              </DropdownMenuItem>
            
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <a href='/auth/login'> 
            <Button>Login / Sign Up</Button>
          </a>
        )}
      </div>

      {/* Mobile view */}
      
      <MenuClient
        profileUrl={profileUrl}
        profileImage={profileImage}
        isLoggedIn={!!authSession}
      />
      
    </div>
  );
}
