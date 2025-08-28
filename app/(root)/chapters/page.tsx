// app/(root)/chapters/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { NewChapterApplicationBanner } from '@/components/Chapters/NewChapterApplicationBanner';
import { CreateChapterButton } from '@/components/Chapters/CreateChapterButton';
import { ChapterCard } from '@/components/Chapters/ChapterCard';
import { ChapterWithData } from '@/app/types/models/chapter';

export default async function ChaptersPage() {
  // Authentication check
  const authenticatedUserProfile = await getAuthenticatedUserProfileOrNull();

  // Bounce if duplicate user
  if (authenticatedUserProfile?.authUser.duplicateOfId) {
    return redirect('/');
  }

  // Fetch all chapters with aggregated data
  const chaptersData = await prisma.chapter.findMany({
    include: {
      _count: {
        select: {
          members: {
            where: {
              memberRole: {
                not: 'BLOCKED'
              }
            }
          },
          events: true
        }
      },
      members: {
        where: {
          memberRole: 'MANAGER'
        },
        include: {
          userProfile: {
            select: {
              givenName: true,
              familyName: true
            }
          }
        },
        take: 3 // Get first 3 managers for display
      },
      events: {
        where: {
          startsAt: {
            not: null
          }
        },
        orderBy: {
          startsAt: 'desc'
        },
        take: 1 // Get most recent event
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // If user is authenticated, get their chapter memberships
  let userChapters: ChapterWithData[] = [];
  let otherChapters: ChapterWithData[] = [];

  if (authenticatedUserProfile) {
    const userMemberships = await prisma.chapterMember.findMany({
      where: {
        userProfileId: authenticatedUserProfile.id,
        memberRole: {
          not: 'BLOCKED'
        }
      },
      select: {
        chapterId: true,
        id: true,
        memberRole: true
      }
    });

    const userChapterIds = new Set(userMemberships.map(m => m.chapterId));

    // Add membership data to chapters and separate user's chapters
    const chaptersWithMembership = chaptersData.map(chapter => ({
      ...chapter,
      userMembership: userMemberships.find(m => m.chapterId === chapter.id) || null
    }));

    userChapters = chaptersWithMembership.filter(chapter => userChapterIds.has(chapter.id));
    otherChapters = chaptersWithMembership.filter(chapter => !userChapterIds.has(chapter.id));
  } else {
    otherChapters = chaptersData.map(chapter => ({ ...chapter, userMembership: null }));
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hockey Playdate Chapters</h1>
        <p className="text-gray-600 text-lg">
          New to Hockey Playdate?
          <br className="sm:hidden" />
          <span className="sm:ml-1">
            <Link href="/getting-started" className="text-blue-600 hover:text-blue-800 underline font-medium">
              Learn how it works
            </Link>
          </span>
        </p>
      </div>

      {/* New Chapter Application Banner */}
      <NewChapterApplicationBanner />

      {/* Search and Admin Controls Row */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* search bar - for future dev*/}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chapters... (coming soon)"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            disabled
          />
        </div>
        
        {/* create new chapter */}
        <CreateChapterButton isAdmin={authenticatedUserProfile?.isAdmin || false} />
      </div>

      {userChapters.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-base font-medium text-gray-700">Your Chapters:</span>
            <div className="flex items-center gap-3 flex-wrap">
              {userChapters.map((chapter) => (
                <Link key={chapter.id} href={`/${chapter.slug}`}>
                  <Badge variant="default" className="hover:bg-blue-600 transition-colors cursor-pointer text-sm px-3 py-1.5">
                    {chapter.name || 'Unnamed Chapter'}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          <Separator className="mt-6" />
        </div>
      )}


      {/* All Chapters Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {userChapters.length > 0 ? 'Browse All Chapters' : 'Browse Chapters'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>

      {/* Empty State for Search Results (Future) */}
      {/* This would show when search returns no results */}
    </div>
  );
}
