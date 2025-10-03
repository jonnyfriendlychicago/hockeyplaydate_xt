// components/chapter/MembershipTab.tsx

import { UserChapterStatus } from "@/lib/helpers/getUserChapterStatus";
import { MembershipTabClient } from "./MembershipTabClient";
import { prisma } from "@/lib/prisma";

interface MembershipTabProps {
  chapterId: number;
  userChapterMember: UserChapterStatus;
}

export async function MembershipTab({ chapterId, userChapterMember }: MembershipTabProps) {
  // Only members and managers should see this tab
  // 2025oct02: below is bogus.  only members/mgrs seeing this tab b/c of logic on parent page.  let's clean up later. 
  if (!userChapterMember.membership) {
    return null;
  }

  // Check if user is the sole manager
  // 2025oct02: 
  // we are gonna update this logic.  right now, it checks for if last manager, ok, cool, but real test is: are you the current OWNER of this chapter? 
  // it's the OWNER who gets blocked.  btw, to be an owner, must be manager too.  will need to implement that. 
  // OWNER is the key factor on removing manager ability, etc. 
  const managerCount = await prisma.chapterMember.count({
    where: {
      chapterId,
      memberRole: 'MANAGER'
    }
  });

  const isSoleManager = userChapterMember.mgrMember && managerCount === 1;

  // Get chapter slug for the server action
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    // select: { slug: true }
    select: { slug: true, name: true }
  });

  return (
    // <MembershipTabClient 
    //   membership={userChapterMember.membership}
    //   isSoleManager={isSoleManager}
    //   chapterSlug={chapter?.slug || ''}
    // />

    <MembershipTabClient 
      membership={userChapterMember.membership}
      isSoleManager={isSoleManager}
      chapterSlug={chapter?.slug || ''}
      chapterName={chapter?.name || ''}  // Add this line
    />
  );
}