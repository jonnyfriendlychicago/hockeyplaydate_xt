// components/Event/rsvp/MemberRsvpCard.tsx

import { Button } from "@/components/ui/button";
import { Edit, Star } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { 
  MemberWithRsvp,
  getDisplayName,
  getRsvpStatusLabel,
  getRsvpStatusIcon,
  getRsvpStatusIconColor,
  getRsvpStatusClass,
  formatPlayerCounts,
  formatSpectatorCounts,
} from "@/lib/types/memberRsvp";

interface MemberRsvpCardProps {
  member: MemberWithRsvp;
  isOwnCard: boolean;
  showEditButton: boolean;
  onEdit?: (member: MemberWithRsvp) => void;
}

export function MemberRsvpCard({ 
  member, 
  isOwnCard,
  showEditButton, 
  onEdit 
}: MemberRsvpCardProps) {
  
  const displayName = getDisplayName(
    member.userProfile.givenName, 
    member.userProfile.familyName
  );
  
  // Handle null rsvp - convert undefined to null for type safety
  const rsvpStatus = member.rsvp?.rsvpStatus ?? null;
  
  const statusLabel = getRsvpStatusLabel(rsvpStatus);
  const StatusIcon = getRsvpStatusIcon(rsvpStatus);
  const statusIconColor = getRsvpStatusIconColor(rsvpStatus);
  const statusClass = getRsvpStatusClass(rsvpStatus);
  const profilePicture = member.userProfile.authUser?.picture;
  const sluggy = member.userProfile.slugVanity || member.userProfile.slugDefault;

  // Format counts for display
  const playerCounts = formatPlayerCounts(
    member.rsvp?.playersYouth ?? null,
    member.rsvp?.playersAdult ?? null
  );
  const spectatorCounts = formatSpectatorCounts(
    member.rsvp?.spectatorsAdult ?? null,
    member.rsvp?.spectatorsYouth ?? null
  );

  return (
  <div 
    className={`p-4 border-2 rounded-lg hover:bg-muted/50 transition-colors ${statusClass}`}
  >
    {/* Desktop: Side-by-side | Mobile: Stacked */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      
      {/* Left: Profile + Info */}
      <div className="flex items-center space-x-3 flex-1">
        
        {/* Profile Picture */}
        <div className="relative w-10 h-10 flex-shrink-0">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name, Status, and Counts */}
        <div className="flex-1">
          
          {/* Name Row with Status Icon */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusIconColor}`} />
            
            <Link 
              href={`/member/${sluggy}`} 
              className="font-medium hover:underline"
            >
              {displayName}
            </Link>
            
            {/* Own Card Indicator */}
            {isOwnCard && (
              <div className="flex items-center gap-1 text-blue-600 flex-shrink-0">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium">You</span>
              </div>
            )}
          </div>

          {/* Status Label */}
          <p className="text-sm text-muted-foreground mb-1">
            {statusLabel}
          </p>

          {/* Player Counts - only show if has counts */}
          {playerCounts && (
            <p className="text-sm font-medium">
              Players: {playerCounts}
            </p>
          )}

          {/* Spectator Counts - only show if exists */}
          {spectatorCounts && (
            <p className="text-xs text-muted-foreground">
              Spectators: {spectatorCounts}
            </p>
          )}

          {/* Own Card Helper Text */}
          {isOwnCard && (
            <p className="text-xs text-blue-600 mt-2">
              Update your RSVP in the &quot;My RSVP&quot; section above
            </p>
          )}
        </div>
      </div>

      {/* Right: Edit Button - stacks below on mobile, right-aligned on desktop */}
      {showEditButton && (
        <div className="flex justify-end sm:justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(member)}
            className="flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>
      )}
    </div>
  </div>
  );
}