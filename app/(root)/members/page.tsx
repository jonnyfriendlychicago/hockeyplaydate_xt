// app/members/page.tsx
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
      .then((data) => setProfiles(data));
  }, []);

  return (
    <section className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Members</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => {
          const displayName =
            profile.authUser.name ||
            profile.altNickname ||
            `${profile.authUser.givenName ?? ''} ${profile.authUser.familyName ?? ''}`.trim() ||
            'Unnamed User';

          const slug = profile.slugVanity || profile.slugDefault;

          return (
            <Link key={profile.id} href={`/member/${slug}`}>
              <Card className="transition hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.authUser.picture || ''} alt={displayName} />
                    <AvatarFallback>
                      {profile.authUser.nickname?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="font-medium text-lg">{displayName}</span>
                    <span className="text-muted-foreground text-sm font-mono">{slug}</span>
                    <span className="text-sm text-muted-foreground">
                      {profile.authUser.email}
                    </span>
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
