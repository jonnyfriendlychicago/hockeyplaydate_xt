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

          {/* devNotes: below is a kinda wacky reverse-slugification: take the slug and revert it back to englishy words for displayed titles on the menu; legacy code, just go with it for now  */}
          <nav className='flex flex-col gap-2 text-base'>
            {['/chapters', '/events',  '/members'].map((path) => (
              <Link key={path} href={path} onClick={() => setOpen(false)}>
                {path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Link>
              
            ))}
            {/* above doesn't work for more than two words in url path, e.g. how-it-works so, just do normal style like below to round it out. */}
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/about">About</Link>
          </nav>

          <ModeToggle />

          {isLoggedIn ? (
            <div className="flex flex-col gap-2 text-base">
              <Link href={profileUrl} onClick={() => setOpen(false)}>Profile</Link>
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
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              <Button>Sign in</Button>
            </Link>
          )}

          <SheetDescription />
        </SheetContent>
      </Sheet>
    </div>
  );
}
