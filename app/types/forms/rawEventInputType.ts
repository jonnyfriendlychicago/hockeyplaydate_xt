// app/types/forms/rawEventInputType.ts

export type RawEventInputType = {
  eventId?: number; // for updates
  chapterId: number;
  title: string | null;
  description: string | null;
  // Location fields (placeholders for now)
  placeId: string | null;
  venueName: string | null;
  address: string | null;
  lat: string | null; // stored as string in form, converted to number for backend
  lng: string | null; // stored as string in form, converted to number for backend
  // Time fields
  startsAt: string | null; // stored as string in form, converted to Date for backend
  durationMin: string | null; // stored as string in form, converted to number for backend
  // bypassAddressValidation: string; 
  bypassAddressValidation: boolean;
};