// app/(root)/members/page.tsx

// 2025oct07: This entire dev and component tree created as impressive first draft.  Still needs complete review, enhance, test. 

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { MembersDirectoryClient } from '@/components/Members/MembersDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function MembersDirectoryPage() {
  
  // 0 - Validate user, part 1: is either (a) NOT authenticated or (b) is authenticated and not-dupe user
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull();

  // If not authenticated, show sign-in message
  if (!authenticatedUserProfile) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        {/* <h1 className="text-4xl font-extrabold text-primary mb-6">Members Directory</h1> */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Members Directory</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Join a chapter to connect with hockey players in your area
          </p>
        </div>
      </section>
    );
  }

  // Get user's chapters where they are MEMBER or MANAGER
  const userChapters = await prisma.chapterMember.findMany({
    where: {
      userProfileId: authenticatedUserProfile.id,
      memberRole: { in: ['MEMBER', 'MANAGER'] }
    },
    select: {
      chapterId: true
    }
  });

  const userChapterIds = userChapters.map(cm => cm.chapterId);

  // If user has no chapters, show message
  if (userChapterIds.length === 0) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        {/* <h1 className="text-4xl font-extrabold text-primary mb-6">Members Directory</h1> */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Members Directory</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You&apos;re not a member of any chapters yet
          </p>
          <p className="text-sm text-muted-foreground">
            Join a chapter to see other members in your area
          </p>
        </div>
      </section>
    );
  }

  // Get all members from user's chapters (excluding self)
  const members = await prisma.userProfile.findMany({
    where: {
      id: { not: authenticatedUserProfile.id }, // Exclude self
      chapterMembership: {
        some: {
          chapterId: { in: userChapterIds },
          memberRole: { in: ['MEMBER', 'MANAGER'] }
        }
      }
    },
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
      },
      chapterMembership: {
        where: {
          chapterId: { in: userChapterIds },
          memberRole: { in: ['MEMBER', 'MANAGER'] }
        },
        select: {
          memberRole: true,
          chapter: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: [
      { familyName: 'asc' },
      { givenName: 'asc' }
    ]
  });

  return (
    <section className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-primary mb-6">Members Directory</h1>
      <p className="text-muted-foreground mb-6">
        Below are all members who are in your hockey playdate chapters
      </p>
      <MembersDirectoryClient members={members} />
    </section>
  );
}
