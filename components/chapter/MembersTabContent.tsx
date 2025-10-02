// components/chapter/MembersTabContent.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { prisma } from "@/lib/prisma";
import { MembersTabClient } from "./MembersTabClient";

interface MembersTabContentProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
}

async function getChapterMembers(chapterId: number) {
  return await prisma.chapterMember.findMany({
    where: {
      chapterId: chapterId,
      memberRole: { in: ['MEMBER', 'MANAGER'] }
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
    orderBy: [
      { memberRole: 'desc' }, // MANAGER before MEMBER
      { createdAt: 'asc' }    // oldest members first
    ]
  });
}

export async function MembersTabContent({ chapterId, userChapterMember }: MembersTabContentProps) {
  // Everyone can see this tab, but content differs based on membership status
  const isApprovedMember = userChapterMember.genMember || userChapterMember.mgrMember;

  if (!isApprovedMember) {
    // Non-members see a message
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Join this chapter to view and connect with members
        </p>
      </div>
    );
  }

  // Members/Managers see the actual member list
  const members = await getChapterMembers(chapterId);
  
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { slug: true }
  });

  return (
    <MembersTabClient 
      members={members}
      userChapterMember={userChapterMember}
      chapterSlug={chapter?.slug || ''}
    />
  );
}

// original placeholder

// import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";

// interface MembersTabContentProps {
//   chapterId: number;
//   userChapterMember: UserChapterStatus;
// }

// export function MembersTabContent({ chapterId, userChapterMember }: MembersTabContentProps) {
    
//     console.log(chapterId )
//     console.log(userChapterMember )
    
//     return (
//         <p className="text-muted-foreground italic">[Members Tab - To Be Built]</p>
//     );
// }