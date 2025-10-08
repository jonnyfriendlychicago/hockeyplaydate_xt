// components/Members/MembersDirectoryClient.tsx

'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MemberDirectoryCard } from "./MemberDirectoryCard";

interface MemberData {
  id: number;
  givenName: string | null;
  familyName: string | null;
  slugDefault: string;
  slugVanity: string | null;
  authUser: {
    picture: string | null;
  } | null;
  chapterMembership: {
    memberRole: string;
    chapter: {
      id: number;
      name: string | null;
      slug: string;
    };
  }[];
}

interface MembersDirectoryClientProps {
  members: MemberData[];
}

export function MembersDirectoryClient({ members }: MembersDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(member => {
    const fullName = `${member.givenName || ''} ${member.familyName || ''}`.toLowerCase();
    const chapterNames = member.chapterMembership
      .map(cm => cm.chapter.name?.toLowerCase() || '')
      .join(' ');
    
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || chapterNames.includes(query);
  });

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No other members found in your chapters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search by name or chapter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredMembers.length} of {members.length} members
      </p>

      {/* Member cards */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <MemberDirectoryCard key={member.id} member={member} />
        ))}
      </div>

      {filteredMembers.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No members found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}