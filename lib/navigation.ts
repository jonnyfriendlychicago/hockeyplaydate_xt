// lib/navigation.ts
// 101: This utility forces a fresh server render of the redirected-to page.  Without this, our client-to-server navigation won't refresh the data
// combination of push and refresh is explained in the Next.js docs and is a recommended pattern. (site?)

'use client';
import { useRouter } from 'next/navigation';

export function useSafeRedirect() {
  const router = useRouter();

  return (url: string) => {
    router.push(url);
    router.refresh();
  };
}
