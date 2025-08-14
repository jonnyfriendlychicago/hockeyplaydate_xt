// components/Event/ManageEventBackendTestForm.tsx
// this entire file purely for testing backend api; it is not intended for production use by real-life end users

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeRedirect } from '@/lib/navigation';
import { RawEventInputType } from '@/app/types/forms/rawEventInputType';

type Props = {
  chapterId: number;
  // initialEventData?: Partial<RawEventInputType>;
  initialEventData?: Partial<RawEventInputType> & { eventId?: number };
};

export default function ManageEventBackendTestForm({ 
  chapterId,
  initialEventData 
}: Props) {

  const safeRedirect = useSafeRedirect();
  const [loading, setLoading] = useState(false);
  const [errorOutput, setErrorOutput] = useState('');
  const [formValues, setFormValues] = 
  // devNotes: below useState/InputType is manual initialization. why needed:
  // chapterId comes from a separate prop - not from initialEventData
  // initialEventData is optional - could be null in CREATE mode
  // Need to merge two data sources: chapterId (always present) + initialEventData (sometimes present)
  // could theoretically use spread operator like this: 
  // useState<RawEventInputType>({ chapterId, ...initialEventData } as RawEventInputType);
  // ... but the explicit approach is clearer and handles the CREATE vs EDIT scenarios more obviously
  useState<RawEventInputType>({
    chapterId: chapterId, // Always locked to the provided chapter
    title: initialEventData?.title || '',
    description: initialEventData?.description || '',
    placeId: initialEventData?.placeId || '',
    venueName: initialEventData?.venueName || '',
    address: initialEventData?.address || '',
    lat: initialEventData?.lat || '',
    lng: initialEventData?.lng || '',
    startsAt: initialEventData?.startsAt || '',
    durationMin: initialEventData?.durationMin || '',
    // ...initialEventData,
  });

  const handleChange = (field: keyof RawEventInputType, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorOutput('');
    
    try {
      // Convert string inputs to appropriate types for backend; 
      // devNotes: this 'const payloard = ...' need not happen for entities like userProfile which is all string fields
      const payload = {
        ...formValues,
        chapterId: chapterId, // Ensure it's always the locked chapter
        lat: formValues.lat ? parseFloat(formValues.lat) : null,
        lng: formValues.lng ? parseFloat(formValues.lng) : null,
        startsAt: formValues.startsAt ? new Date(formValues.startsAt).toISOString() : null,
        durationMin: formValues.durationMin ? parseInt(formValues.durationMin, 10) : null,
      };

      const res = await fetch('/api/event/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        // For CREATE: redirect to new event page
        // For EDIT: redirect to same event page  
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

  // establish variable to define path, for enhanced UX in form
  // devNotes: 
  // !! converts to boolean
  // If initialEventData has an eventId → isUpdate = true (EDIT mode)
  // If no eventId → isUpdate = false (CREATE mode)
  const isUpdate = !!initialEventData?.eventId;

  return (
        // brevity ommission 
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Basic Event Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-2">Event Title</label>
            <Input
              placeholder="Hockey Playdate #23"
              // value={formValues.title}
              value={formValues.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="Join us for another fun hockey playdate..."
              // value={formValues.description}
              value={formValues.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

        </CardContent>
      </Card>

      {/* Location Fields (Placeholders) */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-600">Location (Placeholder Fields)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* <div>
            <label className="block text-sm font-medium mb-2">Google Place ID</label>
            <Input
              placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              // value={formValues.placeId}
              value={formValues.placeId ?? ''}

              onChange={(e) => handleChange('placeId', e.target.value)}
              disabled={loading}
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-2">Venue Name</label>
            <Input
              placeholder="Johnny's Ice House - West"
              // value={formValues.venueName}
              value={formValues.venueName ?? ''}
              onChange={(e) => handleChange('venueName', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              placeholder="123 Hockey Lane, Chicago, IL 60614"
              // value={formValues.address}
              value={formValues.address ?? ''}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Latitude</label>
              <Input
                placeholder="41.8781"
                // value={formValues.lat}
                value={formValues.lat ?? ''}
                onChange={(e) => handleChange('lat', e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Longitude</label>
              <Input
                placeholder="-87.6298"
                // value={formValues.lng}
                value={formValues.lng ?? ''}
                onChange={(e) => handleChange('lng', e.target.value)}
                disabled={loading}
              />
            </div>
          </div> */}

        </CardContent>
      </Card>

      {/* Time Fields (Placeholders) */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-600">Schedule (Placeholder Fields)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-2">Start Date & Time</label>
            <Input
              type="datetime-local"
              // value={formValues.startsAt}
              value={formValues.startsAt ?? ''}
              onChange={(e) => handleChange('startsAt', e.target.value)}
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
              // value={formValues.durationMin}
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