// components/UserProfile/UserProfileNameGate.tsx
// if criteria met,  the EditUserProfileNameForm would appear  omnipresent on all pages. This component prevents that from occurring (suppress!) for certain pages

'use client';

import { usePathname } from 'next/navigation';
import { EditUserProfileNameForm } from './EditUserProfileNameForm';

type Props = {
  givenName: string | null | undefined;
  familyName: string | null | undefined;
  authUserEmail: string;
};

export function UserProfileNameGate({ givenName, familyName , authUserEmail}: Props) {
  const pathname = usePathname();

  const suppress =
    pathname.startsWith('/member/edit') ||
    pathname.startsWith('/member/edit-backend-test');

  if (suppress) return null;

  return (
    <EditUserProfileNameForm
      givenName={givenName}
      familyName={familyName}
      authUserEmail={authUserEmail}
      
    />
  );
}
