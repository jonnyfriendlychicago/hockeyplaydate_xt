// app/(root)/chapters/page.tsx

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, MapPin, Plus, Search } from 'lucide-react';
import { getAuthenticatedUserProfileOrNull } from '@/lib/enhancedAuthentication/authUserVerification';
import { format } from 'date-fns';
import { NewChapterApplicationBanner } from '@/components/Chapters/NewChapterApplicationBanner';

interface ChapterWithData {
  id: number;
  name: string | null;
  description: string | null;
  slug: string;
  createdAt: Date;
  _count: {
    members: number;
    events: number;
  };
  members: Array<{
    id: number;
    memberRole: string;
    userProfile: {
      givenName: string | null;
      familyName: string | null;
    };
  }>;
  events: Array<{
    id: number;
    startsAt: Date | null;
  }>;
  userMembership?: {
    id: number;
    memberRole: string;
  } | null;
}

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

  const formatManagers = (managers: ChapterWithData['members']) => {
    if (managers.length === 0) return 'No organizers listed';
    
    const managerNames = managers
      .slice(0, 2)
      .map(m => {
        const firstName = m.userProfile.givenName || 'Unknown';
        const lastInitial = m.userProfile.familyName?.charAt(0) || '';
        return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
      });

    if (managers.length > 2) {
      return `${managerNames.join(', ')} +${managers.length - 2} others`;
    }
    
    return managerNames.join(', ');
  };

  const getLastEventText = (events: ChapterWithData['events']) => {
    if (events.length === 0) return 'No recent events';
    const lastEvent = events[0];
    if (!lastEvent.startsAt) return 'No recent events';
    return format(lastEvent.startsAt, 'MMM yyyy');
  };

  const ChapterCard = ({ chapter }: { chapter: ChapterWithData }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <Link href={`/${chapter.slug}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-2">
              {chapter.name || 'Unnamed Chapter'}
            </CardTitle>
            {chapter.userMembership ? (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                Member
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 flex-shrink-0">
                View Chapter
              </Badge>
            )}
          </div>
          
          {/* Placeholder for chapter photo */}
          <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center mb-3">
            <MapPin className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-blue-700 font-medium">Chapter Photo</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-gray-500 mr-1" />
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {chapter._count.members}
              </div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-gray-500 mr-1" />
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {chapter._count.events}
              </div>
              <div className="text-xs text-gray-500">Events Hosted</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                Last Event
              </div>
              <div className="text-xs text-gray-500">
                {getLastEventText(chapter.events)}
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Organizers */}
          <div className="text-sm">
            <span className="text-gray-600">Organized by: </span>
            <span className="font-medium text-gray-900">
              {formatManagers(chapter.members)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

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
        <Button variant="outline" disabled className="flex items-center gap-2 sm:flex-shrink-0">
          <Plus className="h-4 w-4" />
          Create New Chapter (Admin)
        </Button>
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
