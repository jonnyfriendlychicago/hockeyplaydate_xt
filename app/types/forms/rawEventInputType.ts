// app/types/forms/rawEventInputType.ts

// export type RawEventInputType = {
//   eventId?: number; // for updates
//   chapterId: number;
//   title: string | null;
//   description: string | null;
//   // Location fields (placeholders for now)
//   placeId: string | null;
//   venueName: string | null;
//   address: string | null;
//   lat: string | null; // stored as string in form, converted to number for backend
//   lng: string | null; // stored as string in form, converted to number for backend
//   // Time fields
//   startsAt: string | null; // stored as string in form, converted to Date for backend
//   durationMin: string | null; // stored as string in form, converted to number for backend
//   // bypassAddressValidation: string; 
//   bypassAddressValidation: boolean;
// };

// 2025aug21: above replaced by below, attempt to resolve persistent event maps bug: places lookup won't work on toggle from manual entry

export type RawEventInputType = {
  eventId?: number; // for updates
  chapterId: number;
  title: string | null;
  description: string | null;
  
  // NEW: 5-field architecture for venue/address
  bypassAddressValidation: boolean;
  
  // Google Places API fields (always present, shown when bypassAddressValidation = false)
  venueByApi: string | null;
  addressByApi: string | null;
  placeId: string | null;
  lat: string | null;
  lng: string | null;
  
  // Manual entry fields (always present, shown when bypassAddressValidation = true)
  venueManualEntry: string | null;
  addressManualEntry: string | null;
  
  // Time fields (unchanged)
  startsAt: string | null;
  durationMin: string | null;
  
  // fyi, these old fields have beenreplaced by the 4 new fields above
  // venueName: string | null;  // REMOVE
  // address: string | null;    // REMOVE
};