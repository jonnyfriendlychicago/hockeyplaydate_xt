// components/Event/VenueSelectorTwo.tsx
// this file called by components/Event/ManageEventBackendTestFormTwo.tsx

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface VenueData {
  placeId: string;
  venueName: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface VenueSelectorProps {
  // Control field
  bypassAddressValidation: boolean;
  
  // Google Places API fields (always present)
  venueByApi: string;
  addressByApi: string;
  placeId: string;
  
  // Manual entry fields (always present)
  venueManualEntry: string;
  addressManualEntry: string;
  
  // Callbacks
  onVenueChange: (venueData: VenueData) => void;
  onVenueByApiChange: (value: string) => void;
  onVenueManualEntryChange: (value: string) => void;
  onAddressManualEntryChange: (value: string) => void;
  onManualModeChange: (isManual: boolean) => void;
  
  // Loading state
  disabled?: boolean;
}

export default function VenueSelector({
  bypassAddressValidation,
  venueByApi,
  addressByApi,
  placeId,
  venueManualEntry,
  addressManualEntry,
  onVenueChange,
  onVenueByApiChange,
  onVenueManualEntryChange,
  onAddressManualEntryChange,
  onManualModeChange,
  disabled = false
}: VenueSelectorProps) {
  
  const venueApiInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [status, setStatus] = useState<string>('');

  // Handle place selection from Google Places API
  const handlePlaceSelect = useCallback(() => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    
    if (!place.place_id) {
      setStatus('Please select a venue from the dropdown suggestions');
      return;
    }

    setSelectedPlace(place);
    
    const venueData: VenueData = {
      placeId: place.place_id,
      venueName: place.name || '',
      address: place.formatted_address || '',
      lat: place.geometry?.location?.lat() || null,
      lng: place.geometry?.location?.lng() || null
    };

    // Update parent form with all venue data
    onVenueChange(venueData);
    setStatus(`Selected: ${place.name}`);
  }, [onVenueChange]);

  // Load Google Maps script (always load, since we always have the API fields)
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Define callback function
      window.initGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsGoogleLoaded(true);
          setStatus('Google Maps loaded successfully');
        } else {
          setTimeout(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              setIsGoogleLoaded(true);
              setStatus('Google Maps loaded successfully');
            } else {
              setStatus('Failed to load Google Maps Places library');
            }
          }, 100);
        }
      };
      
      script.onerror = () => {
        setStatus('Failed to load Google Maps');
      };
      
      document.head.appendChild(script);
    } else if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleLoaded(true);
      setStatus('Google Maps already loaded');
    }
  }, []);

  // Initialize autocomplete when Google Maps is loaded (always initialize)
  useEffect(() => {
    if (isGoogleLoaded && venueApiInputRef.current && !autocompleteRef.current) {
      try {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          setStatus('Google Maps Places library not ready');
          return;
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          venueApiInputRef.current,
          {
            types: ['establishment'],
            fields: ['place_id', 'name', 'formatted_address', 'geometry']
          }
        );

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        setStatus('Venue search ready');
      } catch (error) {
        console.error('Autocomplete creation failed:', error);
        setStatus('Error initializing venue search');
      }
    }
  }, [isGoogleLoaded, handlePlaceSelect]);

  // Handle changes to Google Places API venue field
  const handleVenueApiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onVenueByApiChange(value);
    
    // If user manually types after selecting a place, clear the selection
    // if (selectedPlace && value !== selectedPlace.name) {
    
    // above replace by below: 
    
    // Clear if user types after selecting a place OR if editing pre-existing venue
    if ((selectedPlace && value !== selectedPlace.name) || (placeId && value !== venueByApi)) {
      setSelectedPlace(null);
      setStatus('Venue modified. Search for suggestions or use Reset to start over.');
      
      // Clear the mismatched data
      onVenueChange({
        placeId: '',
        venueName: value,
        address: '',
        lat: null,
        lng: null
      });
    }
  };

  // Reset Google Places API fields
  const resetApiFields = () => {
    const emptyVenueData: VenueData = {
      placeId: '',
      venueName: '',
      address: '',
      lat: null,
      lng: null
    };
    
    onVenueChange(emptyVenueData);
    setSelectedPlace(null);
    setStatus('Fields cleared. Ready for new venue search');
    
    if (venueApiInputRef.current) {
      venueApiInputRef.current.focus();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Venue & Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status indicator (optional - can be hidden) */}
        {false && status && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            {status}
          </div>
        )}

        {/* Mode toggle */}
        <div className="text-center md:text-right">
          {!bypassAddressValidation ? (
            <button
              type="button"
              onClick={() => onManualModeChange(true)}
              disabled={disabled}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Use manually entered values
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onManualModeChange(false)}
              disabled={disabled}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Use venue search values
            </button>
          )}
        </div>

        {/* Warning for manual entry */}
        {bypassAddressValidation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <strong className="text-yellow-800">Warning:</strong> 
            <span className="text-yellow-700"> Manually entered venues/addresses will disable map services. 
            Only use this option if your venue for sure cannot be found using the venue search / lookup. 
            Remember: you can add enhanced location details in your event description (e.g.,  quote playdate will be at East rink near 5th Ave quote ). 
            </span>
          </div>
        )}

        {/* GOOGLE PLACES API FIELDS - always shown for testing */}
        
          <div className={bypassAddressValidation ? 'hidden' : 'block'}>
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <Input
                ref={venueApiInputRef}
                placeholder="Start typing a venue name..."
                value={venueByApi}
                onChange={handleVenueApiInputChange}
                disabled={disabled || !isGoogleLoaded}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isGoogleLoaded ? 'Type to search venues' : 'Loading venue search...'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <Input
                placeholder="Address will populate automatically..."
                value={addressByApi}
                readOnly
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-fills when venue is selected
              </p>
            </div>

                      {/* Debug info in development */}
          {false && process.env.NODE_ENV === 'development' && placeId && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Debug:</strong> Place ID: {placeId}
            </div>
          )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetApiFields}
              disabled={disabled || (venueByApi.length === 0 && addressByApi.length === 0)}
            >
              Reset API FieldsY
            </Button>


        </>
        </div>  
        


        {/* MANUAL ENTRY FIELDS - always shown for testing */}
        
          <div className={bypassAddressValidation ? 'block' : 'hidden'}>
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <Input
                placeholder="Enter venue name manually"
                value={venueManualEntry}
                onChange={(e) => onVenueManualEntryChange(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Manual entry - no autocomplete
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <Input
                placeholder="Enter address manually"
                value={addressManualEntry}
                onChange={(e) => onAddressManualEntryChange(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Manual entry - no validation
              </p>
            </div>
            </>
            </div>
         


      </CardContent>
    </Card>
  );
}