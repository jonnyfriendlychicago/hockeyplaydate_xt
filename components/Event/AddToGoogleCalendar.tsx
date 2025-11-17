// components/Event/AddToGoogleCalendar.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type AddToGoogleCalendarProps = {
  event: {
    title: string;
    description?: string;
    venueName?: string;
    address?: string;
    startsAt: Date | null;
    endsAt: Date | null;
  };
  userRsvpStatus?: 'YES' | 'NO' | 'MAYBE' | null;
  disabled?: boolean;
};

// export default function AddToGoogleCalendar({
export function AddToGoogleCalendar({ 
  event, 
  userRsvpStatus, 
  disabled = false 
}: AddToGoogleCalendarProps) {
  const [showRsvpWarning, setShowRsvpWarning] = useState(false);

  // Format date for Google Calendar (YYYYMMDDTHHMMSS)
  const formatDateForGoogle = (date: Date | null): string => {
    if (!date) return '';
    
    // Convert to Chicago timezone for Google Calendar
    const chicagoDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    const year = chicagoDate.getFullYear();
    const month = String(chicagoDate.getMonth() + 1).padStart(2, '0');
    const day = String(chicagoDate.getDate()).padStart(2, '0');
    const hours = String(chicagoDate.getHours()).padStart(2, '0');
    const minutes = String(chicagoDate.getMinutes()).padStart(2, '0');
    const seconds = String(chicagoDate.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  // Generate Google Calendar URL
  const generateGoogleCalendarUrl = (): string => {
    if (!event.startsAt) return '';

    const startDate = formatDateForGoogle(event.startsAt);
    const endDate = event.endsAt ? formatDateForGoogle(event.endsAt) : '';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || 'Hockey Event',
      dates: endDate ? `${startDate}/${endDate}` : startDate,
      ctz: 'America/Chicago',
      details: event.description || '',
      location: [event.venueName, event.address].filter(Boolean).join(', '),
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToCalendar = () => {
    // If user hasn't RSVP'd "YES", show warning dialog
    if (userRsvpStatus !== 'YES') {
      setShowRsvpWarning(true);
      return;
    }

    // User has RSVP'd "YES", proceed directly to Google Calendar
    const calendarUrl = generateGoogleCalendarUrl();
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };

  const handleProceedAnyway = () => {
    setShowRsvpWarning(false);
    const calendarUrl = generateGoogleCalendarUrl();
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };

  // Don't render if no start time
  if (!event.startsAt) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2" 
        onClick={handleAddToCalendar}
        disabled={disabled}
      >
        <Calendar className="w-4 h-4" />
        Add to Google Calendar
      </Button>

      {/* RSVP Warning Dialog */}
      <Dialog open={showRsvpWarning} onOpenChange={setShowRsvpWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>RSVP Reminder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              We don&apos;t have your RSVP for this event yet. Please make sure to do that; 
              don&apos;t just add this to your calendar and show up. Okay? :-)
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRsvpWarning(false)}
            >
              Cancel Add to Cal
            </Button>
            <Button onClick={handleProceedAnyway}>
              Got it, Proceed to Cal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}