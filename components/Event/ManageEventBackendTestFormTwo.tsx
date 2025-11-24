// components/Event/ManageEventBackendTestFormTwo.tsx
// this entire file purely for testing backend api; it is not intended for production use by real-life end users

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeRedirect } from '@/lib/navigation';
import { RawEventInputType } from '@/app/types/forms/rawEventInputType';
import VenueSelector from './VenueSelectorTwo';
import { useCallback } from 'react';
// ADD these imports at the top
import { parseISO } from 'date-fns';
// import { zonedTimeToUtc } from 'date-fns-tz';
import { fromZonedTime } from 'date-fns-tz';

type Props = {
  chapterId: number;
  initialEventData?: Partial<RawEventInputType> & { 
    eventId?: number ; 
      venueName?: string;  // OLD FIELD - for backward compatibility
    address?: string;    // OLD FIELD - for backward compatibility
    };
};

export default function ManageEventBackendTestForm({ 
  chapterId,
  initialEventData 
}: Props) {

  const safeRedirect = useSafeRedirect();
  const [loading, setLoading] = useState(false);
  const [errorOutput, setErrorOutput] = useState('');
  
  // UPDATED: Initialize with 5-field architecture
  const [formValues, setFormValues] = useState<RawEventInputType>({
    chapterId: chapterId,
    title: initialEventData?.title || '',
    description: initialEventData?.description || '',
    startsAt: initialEventData?.startsAt || '',
    durationMin: initialEventData?.durationMin || '',
    endsAt: initialEventData?.endsAt || '',    
    bypassAddressValidation: initialEventData?.bypassAddressValidation || false,
    
    // NEW: Initialize all 4 venue/address fields
    // For existing data, put it in the appropriate fields based on bypassAddressValidation
    venueByApi: !initialEventData?.bypassAddressValidation ? (initialEventData?.venueName || '') : '',
    addressByApi: !initialEventData?.bypassAddressValidation ? (initialEventData?.address || '') : '',
    placeId: initialEventData?.placeId || '',
    lat: initialEventData?.lat || '',
    lng: initialEventData?.lng || '',
    
    venueManualEntry: initialEventData?.bypassAddressValidation ? (initialEventData?.venueName || '') : '',
    addressManualEntry: initialEventData?.bypassAddressValidation ? (initialEventData?.address || '') : '',
  });

  const handleChange = (field: keyof RawEventInputType, value: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // UPDATED: Handle venue changes for Google Places API
  const handleVenueChange = useCallback((venueData: {
    placeId: string;
    venueName: string;
    address: string;
    lat: number | null;
    lng: number | null;
  }) => {
    setFormValues((prev) => ({
      ...prev,
      placeId: venueData.placeId,
      venueByApi: venueData.venueName,
      addressByApi: venueData.address,
      lat: venueData.lat?.toString() || '',
      lng: venueData.lng?.toString() || '',
    }));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorOutput('');
    
    try {
      // UPDATED: Use correct venue/address fields based on bypassAddressValidation
      const activeVenueName = formValues.bypassAddressValidation 
        ? formValues.venueManualEntry 
        : formValues.venueByApi;
      
      const activeAddress = formValues.bypassAddressValidation 
        ? formValues.addressManualEntry 
        : formValues.addressByApi;
      
      // Convert to backend format (this stays the same as before)
      const payload = {
        chapterId: chapterId,
        title: formValues.title,
        description: formValues.description,
        
        // Use active fields for backend
        venueName: activeVenueName,
        address: activeAddress,
        placeId: formValues.bypassAddressValidation ? null : formValues.placeId,
        lat: formValues.bypassAddressValidation ? null : (formValues.lat ? parseFloat(formValues.lat) : null),
        lng: formValues.bypassAddressValidation ? null : (formValues.lng ? parseFloat(formValues.lng) : null),
        
        // startsAt: formValues.startsAt ? new Date(formValues.startsAt).toISOString() : null,
        // endsAt: formValues.endsAt ? new Date(formValues.endsAt).toISOString() : null,  
        // above replaced by below
        // startsAt: formValues.startsAt 
        //   ? zonedTimeToUtc(parseISO(formValues.startsAt), 'America/Chicago') 
        //   : null,
        // endsAt: formValues.endsAt 
        //   ? zonedTimeToUtc(parseISO(formValues.endsAt), 'America/Chicago') 
        //   : null,

        // below change uses correct updated function name 'toZoneTime'; 
        startsAt: formValues.startsAt 
          ? fromZonedTime(parseISO(formValues.startsAt), 'America/Chicago') 
          : null,
        endsAt: formValues.endsAt 
          ? fromZonedTime(parseISO(formValues.endsAt), 'America/Chicago') 
          : null,

        durationMin: formValues.durationMin ? parseInt(formValues.durationMin, 10) : null,
        bypassAddressValidation: formValues.bypassAddressValidation,
        
        ...(initialEventData?.eventId && { eventId: initialEventData.eventId }),
      };

      const res = await fetch('/api/event/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        safeRedirect(`/event/${result.event.presentableId}`);
      } else {
        setErrorOutput(JSON.stringify(result, null, 2));
      }

    } catch (err) {
      if (err instanceof Error) {
        setErrorOutput(err.message);
      } else {
        setErrorOutput('Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  const isUpdate = !!initialEventData?.eventId;

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Basic Event Info - UNCHANGED */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-2">Event Title</label>
            <Input
              placeholder="Hockey Playdate #23"
              value={formValues.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="Join us for another fun hockey playdate..."
              value={formValues.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

        </CardContent>
      </Card>

      {/* UPDATED: VenueSelector with new props for 5-field architecture */}
      <VenueSelector
        // Control field
        bypassAddressValidation={formValues.bypassAddressValidation}
        
        // Google Places API fields
        venueByApi={formValues.venueByApi ?? ''}
        addressByApi={formValues.addressByApi ?? ''}
        placeId={formValues.placeId ?? ''}
        
        // Manual entry fields
        venueManualEntry={formValues.venueManualEntry ?? ''}
        addressManualEntry={formValues.addressManualEntry ?? ''}
        
        // Callbacks
        onVenueChange={handleVenueChange}
        onVenueByApiChange={(value) => handleChange('venueByApi', value)}
        // onAddressByApiChange={(value) => handleChange('addressByApi', value)}
        onVenueManualEntryChange={(value) => handleChange('venueManualEntry', value)}
        onAddressManualEntryChange={(value) => handleChange('addressManualEntry', value)}
        onManualModeChange={(isManual) => handleChange('bypassAddressValidation', isManual)}
        
        disabled={loading}
      />

      {/* Time Fields - UNCHANGED */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-600">Schedule (Placeholder Fields)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-2">Start Date & Time</label>
            <Input
              type="datetime-local"
              value={formValues.startsAt ?? ''}
              onChange={(e) => handleChange('startsAt', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date & Time</label>
            <Input
              type="datetime-local"
              value={formValues.endsAt ?? ''}
              onChange={(e) => handleChange('endsAt', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <Input
              type="number"
              placeholder="90"
              min="15"
              max="480"
              value={formValues.durationMin ?? ''}
              onChange={(e) => handleChange('durationMin', e.target.value)}
              disabled={loading}
            />
          </div>

        </CardContent>
      </Card>

      <Button type="submit" className={loading ? 'opacity-50 cursor-not-allowed' : ''} disabled={loading}>
        {loading ? 'Saving...' : isUpdate ? 'Update Event' : 'Create Event'}
      </Button>

      <Textarea
        value={errorOutput}
        readOnly
        rows={200}
        className="text-sm font-mono text-red-600"
        placeholder="Error output from backend will appear here..."
      />
    </form>
  );
}