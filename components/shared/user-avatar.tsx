// components/shared/user-avatar.tsx

'use client';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import clsx from 'clsx';

type UserAvatarProps = {
  src?: string | null;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  altProp : string
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-28 h-28',
  xl: 'w-56 h-56',
};

const imageSize = {
  sm: 32,
  md: 48,
  lg: 96,
  xl: 224 // 56 * 4 = 224px
};

export function UserAvatar({
  src,
  fallback = 'U',
  size = 'md',
  className,
  altProp
}: UserAvatarProps) {
  const dimension = imageSize[size];

  return (
    <Avatar className={clsx(sizeClasses[size], className)}>
      {/* Next.js <Image> handles optimization, caching, domain restrictions */}
      {src ? (
        <Image
            src={src}
            alt={altProp}
            width={dimension}
            height={dimension}
            className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <AvatarFallback>{fallback}</AvatarFallback>
      )}
    </Avatar>
  );
}
