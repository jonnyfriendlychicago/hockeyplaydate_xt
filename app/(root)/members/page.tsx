// app/(root)/members/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type Profile = {
  id: number;
  slugDefault: string;
  slugVanity: string | null;
  altEmail: string | null;
  altNickname: string | null;
  phone: string | null;
  givenName: string | null; // 2025arp09: newly added field to model/table, and using herein now
  familyName: string | null; // 2025arp09: newly added field to model/table, and using herein now

  authUser: {
    name: string | null;
    email: string;
    picture: string | null;
    nickname: string | null;
    givenName: string | null;
    familyName: string | null;
  };
};

export default function MembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      // .then((data) => setProfiles(data));
      // above is simple "display the data"; below is sorting this data.  
      .then((data) => {
        const sorted = data.sort((a: Profile, b: Profile) => {
          const aHasNames = a.givenName && a.familyName;
          const bHasNames = b.givenName && b.familyName;
      
          // If only one has names, prioritize the one that does
          if (aHasNames && !bHasNames) return -1;
          if (!aHasNames && bHasNames) return 1;
      
          // If both are missing names, keep order
          if (!aHasNames && !bHasNames) return 0;
      
          // Both have names: sort by givenName, then familyName
          const givenCompare = a.givenName!.localeCompare(b.givenName!);
          if (givenCompare !== 0) return givenCompare;
          return a.familyName!.localeCompare(b.familyName!);
        });
      
        setProfiles(sorted);

        
      });

  }, []);

  return (
    <section className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Members</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => {

          const familyBrand = profile.altNickname || null;

          const displayName =`${profile.givenName ?? ''} ${profile.familyName ?? ''}`.trim() || profile.authUser.email || 'Nameless Emailless User';

          const incompleteProfileName = !profile.familyName || !profile.givenName; 

          const slug = profile.slugVanity || profile.slugDefault;

          return (
            <Link key={profile.id} href={`/member/${slug}`}>
              {/* <Card className="transition hover:shadow-md cursor-pointer"> */}
              <Card
              className={`transition hover:shadow-md cursor-pointer ${incompleteProfileName ? 'bg-yellow-50 border border-yellow-300' : ''}`}
              >


                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.authUser.picture || ''} alt={displayName} />
                    <AvatarFallback>
                      {profile.authUser.nickname?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                  
                  {/* <span className="font-medium text-lg">{familyBrand}</span>
                  <span className="font-medium text-lg">{displayName}</span> */}

                  {familyBrand ? (
                    <>
                      <span className="font-medium text-lg">{familyBrand}</span>
                      <span className="text-sm text-muted-foreground">{displayName}</span>
                    </>
                  ) : (
                    <span className="font-medium text-lg">{displayName}</span>
                  )}

                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
