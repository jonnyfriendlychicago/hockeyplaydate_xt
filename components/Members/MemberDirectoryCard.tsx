// components/Members/MemberDirectoryCard.tsx

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getDisplayName, getMaskedRole } from "@/lib/types/chapterMember";

interface MemberDirectoryCardProps {
  member: {
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
  };
}

export function MemberDirectoryCard({ member }: MemberDirectoryCardProps) {
  const displayName = getDisplayName(member.givenName, member.familyName);
  const profilePicture = member.authUser?.picture;
  const sluggy = member.slugVanity || member.slugDefault;

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
      <div className="flex items-start space-x-3">
        {/* Profile Picture */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-base font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name and Chapters */}
        <div className="space-y-2">
          <div>
            <Link 
              href={`/member/${sluggy}`} 
              className="font-medium text-lg hover:underline"
            >
              {displayName}
            </Link>
          </div>
          
          {/* Chapter memberships */}
          <div className="flex flex-wrap gap-2">
            {member.chapterMembership.map((cm) => (
              <div key={cm.chapter.id} className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getMaskedRole(cm.memberRole)}
                </Badge>
                <Link 
                  href={`/${cm.chapter.slug}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {cm.chapter.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}