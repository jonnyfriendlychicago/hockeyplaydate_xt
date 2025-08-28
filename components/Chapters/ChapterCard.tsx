// components/Chapters/ChapterCard.tsx

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ChapterWithData } from '@/app/types/models/chapter';

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

export const ChapterCard = ({ chapter }: { chapter: ChapterWithData }) => (
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