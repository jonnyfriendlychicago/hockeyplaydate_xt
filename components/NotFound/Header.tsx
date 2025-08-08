// components/NotFound/Header.tsx

import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

const Header = () => {
  return (
    <header className='w-full border-b'>
      <div className='wrapper flex-between items-center py-2'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='flex items-center'>
            <Image
              priority={true}
              src='/images/HP_logo_02_1024x1024_transp.svg'
              width={48}
              height={48}
              alt={`${APP_NAME} logo`}
            />
            <span className='hidden lg:block font-bold text-2xl ml-3'>
              {APP_NAME}
            </span>
          </Link>

          {/* Global Navigation - visible on md+ */}
          <nav className='hidden md:flex gap-4 text-sm font-medium'>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/events">Events</Link>
            <Link href="/groups">Groups</Link>
            <Link href="/members">Members</Link>
            <Link href="/getting-started">Getting Started</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>

        {/* Empty space where menu would be - maintains layout balance */}
        <div className='w-8'></div>
      </div>
    </header>
  );
};

export default Header;