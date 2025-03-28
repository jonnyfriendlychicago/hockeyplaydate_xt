import { EllipsisVertical} from 'lucide-react';
// import { ShoppingCart , UserIcon} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ModeToggle from './mode-toggler';
import { auth0 } from "@/lib/auth0"; // from Auth0
import Image from 'next/image';
import profileDefault from '@/public/images/HP_logo_02_1024x1024_transp.svg';

// const Menu = () => {
export default async function  Menu  ()  {

  const session = await auth0.getSession();
  const profileImage = session?.user?.picture;
  

  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        
        <ModeToggle />
        
        {/* <Button asChild variant='ghost'>
          <Link href='/cart'>
            <ShoppingCart /> Cart
          </Link>
        </Button> */}

        {session ? 
          <>
            <a href="/auth/logout">
              <Button>Logout</Button>
              </a>

            <Image
              className='h-8 w-8 rounded-full'
              src={profileImage || profileDefault}
              alt=''
              width={40}
              height={40}
              />
          </>
        : 
        <a href="/auth/login">
            <Button>Sign in / Sign Up</Button>
            </a>
      // <Button asChild>
      //       <Link href='/sign-in'>
      //         <UserIcon/>Sign In
      //         </Link>
      //     </Button>
        }

      </nav>

      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start'>
            <SheetTitle>Menu</SheetTitle>
            
            <ModeToggle />
            
            {/* <Button asChild variant='ghost'>
              <Link href='/cart'>
                <ShoppingCart /> Cart
              </Link>
            </Button>
            
            <Button asChild>
              <Link href='/sign-in'>
                <UserIcon/>Sign In
              </Link>
            </Button> */}

        {session ? 
          <>
            <a href="/auth/logout">
              <Button>Logout</Button>
              </a>

            <Image
              className='h-8 w-8 rounded-full'
              src={profileImage || profileDefault}
              alt=''
              width={40}
              height={40}
              />
          </>
        : 
          <a href="/auth/login">
            <Button>Sign in</Button>
            </a>

        }
            
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

// export default Menu;
