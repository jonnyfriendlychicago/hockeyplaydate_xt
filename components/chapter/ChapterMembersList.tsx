// components/chapter/ChapterMembersList.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { prisma } from "@/lib/prisma";
import { ChapterMembersListClient } from "./ChapterMembersListClient";
import { MemberRole } from '@/lib/constants/membershipEnums';

type MemberFilter = 'applicants' | 'members' | 'restricted';

interface ChapterMembersListProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
  filter: MemberFilter;
}

function getEmptyMessage(filter: MemberFilter): string {
  switch (filter) {
    case 'applicants': return 'No pending applications';
    case 'members': return 'No members yet';
    case 'restricted': return 'No restricted members';
  }
}

function getTitle(filter: MemberFilter, count: number): string {
  switch (filter) {
    case 'applicants': return `Pending Applications (${count})`;
    case 'members': return `Chapter Members (${count})`;
    case 'restricted': return `Restricted Members (${count})`;
  }
}

// devNote: we originally tried to have a single query that would accept a parameter, so one prisma query instead of three. But that just not gonna work easily in typescript. So embrace below. 

async function getFilteredMembers(chapterId: number, filter: MemberFilter) {
  if (filter === 'applicants') {
    return await prisma.chapterMember.findMany({
      where: {
        chapterId,
        // memberRole: 'APPLICANT'
        memberRole: MemberRole.APPLICANT
      },
      include: {
        userProfile: {
          select: {
            id: true,
            givenName: true,
            familyName: true,
            slugDefault: true,
            slugVanity: true,
            authUser: {
              select: {
                picture: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  if (filter === 'members') {
    return await prisma.chapterMember.findMany({
      where: {
        chapterId,
        // memberRole: { in: ['MEMBER', 'MANAGER'] }
        memberRole: { in: [MemberRole.MEMBER, MemberRole.MANAGER] }
      },
      include: {
        userProfile: {
          select: {
            id: true,
            givenName: true,
            familyName: true,
            slugDefault: true,
            slugVanity: true,
            authUser: {
              select: {
                picture: true
              }
            }
          }
        }
      },
      orderBy: [{ memberRole: 'desc' }, { createdAt: 'asc' }]
    });
  }
  
  // filter === 'restricted'
  return await prisma.chapterMember.findMany({
    where: {
      chapterId,
      // memberRole: { in: ['BLOCKED', 'REMOVED'] }
      memberRole: { in: [MemberRole.BLOCKED, MemberRole.REMOVED] }
    },
    include: {
      userProfile: {
        select: {
          id: true,
          givenName: true,
          familyName: true,
          slugDefault: true,
          slugVanity: true,
          authUser: {
            select: {
              picture: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function ChapterMembersList({ chapterId, userChapterMember, filter }: ChapterMembersListProps) {
  if (filter === 'members' && !userChapterMember.genMember && !userChapterMember.mgrMember) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Join this chapter to view and connect with members
        </p>
      </div>
    );
  }

  const members = await getFilteredMembers(chapterId, filter);
  
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { slug: true }
  });

  return (
    <ChapterMembersListClient 
      members={members}
      userChapterMember={userChapterMember}
      chapterSlug={chapter?.slug || ''}
      emptyMessage={getEmptyMessage(filter)}
      title={getTitle(filter, members.length)}
    />
  );
}