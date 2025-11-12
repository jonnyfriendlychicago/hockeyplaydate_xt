// lib/types/memberRsvp.ts

import { RsvpStatus, MemberRole } from '@prisma/client';
import { CheckCircle, XCircle, HelpCircle, Circle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

/**
 * Represents a chapter member with their RSVP data for a specific event
 * Used in MemberRsvpList components
 */
export interface MemberWithRsvp {
  id: number;                    // chapterMember.id
  chapterId: number;
  userProfileId: number;
  memberRole: MemberRole;        // Only MEMBER or MANAGER will appear
  joinedAt: Date;
  userProfile: {
    id: number;
    givenName: string | null;
    familyName: string | null;
    slugDefault: string;
    slugVanity: string | null;
    authUser: {
      picture: string | null;
    } | null;
  };
  rsvp: {
    id: number;
    rsvpStatus: RsvpStatus | null;
    playersYouth: number | null;
    playersAdult: number | null;
    spectatorsAdult: number | null;
    spectatorsYouth: number | null;
  } | null;  // null = no RSVP submitted yet
}

/**
 * Get display name from user profile
 * Reuses logic from chapterMember types
 */
export function getDisplayName(givenName: string | null, familyName: string | null): string {
  const first = givenName || '';
  const last = familyName || '';
  return `${first} ${last}`.trim() || 'Unknown User';
}

/**
 * Get user-friendly RSVP status label
 */
export function getRsvpStatusLabel(status: RsvpStatus | null): string {
  switch (status) {
    case RsvpStatus.YES:
      return 'Going';
    case RsvpStatus.NO:
      return 'Out';
    case RsvpStatus.MAYBE:
      return 'Maybe';
    case null:
      return 'No Reply';
    default:
      return 'Unknown';
  }
}

/**
 * Get Lucide icon component for RSVP status
 * Returns the icon component (not JSX) for flexible usage
 */
export function getRsvpStatusIcon(status: RsvpStatus | null): LucideIcon {
  switch (status) {
    case RsvpStatus.YES:
      return CheckCircle;  // Green check
    case RsvpStatus.NO:
      return XCircle;      // Red X
    case RsvpStatus.MAYBE:
      return HelpCircle;   // Yellow question
    case null:
      return Circle;       // Gray circle (empty/no reply)
    default:
      return Circle;
  }
}

/**
 * Get icon color class for status
 */
export function getRsvpStatusIconColor(status: RsvpStatus | null): string {
  switch (status) {
    case RsvpStatus.YES:
      return 'text-green-600';
    case RsvpStatus.NO:
      return 'text-red-600';
    case RsvpStatus.MAYBE:
      return 'text-yellow-600';
    case null:
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get Tailwind CSS classes for status-based styling (border, subtle bg)
 */
export function getRsvpStatusClass(status: RsvpStatus | null): string {
  switch (status) {
    case RsvpStatus.YES:
      return 'border-green-200 bg-green-50/50';
    case RsvpStatus.NO:
      return 'border-red-200 bg-red-50/50';
    case RsvpStatus.MAYBE:
      return 'border-yellow-200 bg-yellow-50/50';
    case null:
      return 'border-gray-200 bg-gray-50/50';
    default:
      return 'border-gray-200';
  }
}

/**
 * Format player counts for display
 * Returns string like "2 youth, 1 adult" or null if no players
 */
export function formatPlayerCounts(
  playersYouth: number | null,
  playersAdult: number | null
): string | null {
  const youth = playersYouth || 0;
  const adult = playersAdult || 0;
  
  if (youth === 0 && adult === 0) {
    return null;
  }
  
  const parts: string[] = [];
  if (youth > 0) parts.push(`${youth} youth`);
  if (adult > 0) parts.push(`${adult} adult`);
  
  return parts.join(', ');
}

/**
 * Format spectator counts for display
 * Returns string like "1 adult, 2 youth" or null if no spectators
 */
export function formatSpectatorCounts(
  spectatorsAdult: number | null,
  spectatorsYouth: number | null
): string | null {
  const adult = spectatorsAdult || 0;
  const youth = spectatorsYouth || 0;
  
  if (adult === 0 && youth === 0) {
    return null;
  }
  
  const parts: string[] = [];
  if (adult > 0) parts.push(`${adult} adult`);
  if (youth > 0) parts.push(`${youth} youth`);
  
  return parts.join(', ');
}

/**
 * Check if member has any attendance details to display
 * Only YES status can have attendance details
 */
export function hasAttendanceDetails(rsvp: MemberWithRsvp['rsvp']): boolean {
  if (!rsvp || rsvp.rsvpStatus !== RsvpStatus.YES) {
    return false;
  }
  
  const totalPlayers = (rsvp.playersYouth || 0) + (rsvp.playersAdult || 0);
  const totalSpectators = (rsvp.spectatorsAdult || 0) + (rsvp.spectatorsYouth || 0);
  
  return totalPlayers > 0 || totalSpectators > 0;
}