// components/shared/header/menu.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0
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

export default async function Menu() {
  const session = await auth0.getSession();
  const profileImage = session?.user?.picture;
  // const profileLink  = '/member/' + session?.user.  // let's get back to this later.  need to get member slug and have that be the link to profile. 

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
                <Link href='/profile'>Profile</Link>
                {/* <Link href={}>Profile</Link> // let's get back to this later.  need to get member slug and have that be the link to profile. */} 
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

// 2025-apr-04: below replaced by above 

// components/shared/header/menu.tsx
// everything session related here derived from https://auth0.com/docs/quickstart/webapp/nextjs/interactive
// additional documentation: https://github.com/auth0/nextjs-auth0

// import { EllipsisVertical} from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import ModeToggle from './mode-toggler';
// import { auth0 } from "@/lib/auth0"; // from Auth0
// import Image from 'next/image';
// import profileDefault from '@/public/images/HP_logo_02_1024x1024_transp.svg';

// export default async function  Menu  ()  {

//   const session = await auth0.getSession();
//   const profileImage = session?.user?.picture;
  

//   return (
//     <div className='flex justify-end gap-3'>
//       <nav className='hidden md:flex w-full max-w-xs gap-1'>
        
//         <ModeToggle />

//         {session ? 
//           <>
//             <a href="/auth/logout">
//               <Button>Logout</Button>
//               </a>

//             <Image
//               className='h-8 w-8 rounded-full'
//               src={profileImage || profileDefault}
//               alt=''
//               width={40}
//               height={40}
//               />
//           </>
//         : 
//         <a href="/auth/login">
//             <Button>Sign in / Sign Up</Button>
//             </a>
//         }

//       </nav>

//       <nav className='md:hidden'>
//         <Sheet>
//           <SheetTrigger className='align-middle'>
//             <EllipsisVertical />
//           </SheetTrigger>
//           <SheetContent className='flex flex-col items-start'>
//             <SheetTitle>Menu</SheetTitle>
            
//             <ModeToggle />

//         {session ? 
//           <>
//             <a href="/auth/logout">
//               <Button>Logout</Button>
//               </a>

//             <Image
//               className='h-8 w-8 rounded-full'
//               src={profileImage || profileDefault}
//               alt=''
//               width={40}
//               height={40}
//               />
//           </>
//         : 
//           <a href="/auth/login">
//             <Button>Sign in</Button>
//             </a>

//         }
            
//             <SheetDescription></SheetDescription>
//           </SheetContent>
//         </Sheet>
//       </nav>
//     </div>
//   );
// };

