// app/(root)/members/page.tsx
// 2025may16: note for future self: 
// (1) we should enhance this to use a function from lib/enhancedAuthentication/authUserVerification.ts and 
// (2) this entire file needs to be updated: only display those users who are fellow members of authenticated users groups

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

  const showTempPage = process.env.NEXT_PUBLIC_SHOW_TEMP_PAGE_MEMBERS?.toLowerCase() === 'true'; // make doubly sure variable exists and value read correctly

  // 2025ju06: below added to prevent members (even tho no one started using yet) from being displayed cold to public unprotected page.  
  if (showTempPage) // 101: NEXT_PUBLIC_* variables will be read as boolean, hence no "equals..." functionality here. 
    return ( 
      <main>
        <h1>Members Page (Placeholder)</h1>
        <p>
          This is a placeholder page for what eventually will be the production members page. <br/>
          Non-authenticated users will see an about members info blurb, with some examples of what authenticated users will see. <br/>
          Authenticated users will see an expandable minimized version of that info blurb, PLUS: 
          a card array of all hockey playdate members which are members of the same group as the logged in user.<br/>
          Anticipated features will include search/filtering, etc. 
          </p>
      </main>
    );

  // 2025jun06: note major updated needed to below: once groups have been built, we can enhanced below to display cars for only those members which are members of the same group as the logged in user.
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
