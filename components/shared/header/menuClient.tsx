// components/shared/header/MenuClient.tsx

'use client';
import { useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ModeToggle from './mode-toggler';
import Image from 'next/image';
import profileDefault from '@/public/images/HP_logo_02_1024x1024_transp.svg';

type Props = {
  profileUrl: string;
  profileImage?: string | null;
  sessionEmail?: string | null;
  isLoggedIn: boolean;
};

export default function MenuClient({
  profileUrl,
  profileImage,
  isLoggedIn,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className='md:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className='align-middle'>
          <EllipsisVertical />
        </SheetTrigger>
        <SheetContent className='flex flex-col items-start gap-4'>
          <SheetTitle>Menu</SheetTitle>

          <nav className='flex flex-col gap-2 text-base'>
            {['/events', '/groups', '/members', '/getting-started', '/about'].map((path) => (
              <Link key={path} href={path} onClick={() => setOpen(false)}>
                {path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Link>
            ))}
          </nav>

          <ModeToggle />

          {isLoggedIn ? (
            <div className="flex flex-col gap-2 text-base">
              <Link href={profileUrl} onClick={() => setOpen(false)}>Profile</Link>
              {/* <a href="/auth/logout" onClick={() => setOpen(false)}>Logout</a> */}
              <Link href="/auth/logout" onClick={() => setOpen(false)}>Logout</Link>
              <Image
                className='h-8 w-8 rounded-full mt-2'
                src={profileImage || profileDefault}
                alt='User avatar'
                width={40}
                height={40}
              />
            </div>
          ) : (
            // <a href="/auth/login" onClick={() => setOpen(false)}>
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              <Button>Sign in</Button>
            {/* </a> */}
            </Link>
          )}

          <SheetDescription />
        </SheetContent>
      </Sheet>
    </div>
  );
}
