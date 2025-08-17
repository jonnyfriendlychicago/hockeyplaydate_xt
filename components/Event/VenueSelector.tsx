// components/Event/VenueSelector.tsx
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
  // Current values from your form
  venueName: string;
  address: string;
  placeId: string;
  bypassAddressValidation: boolean;  
  
  // Callbacks to update parent form
  onVenueChange: (venueData: VenueData) => void;
  onVenueNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onManualModeChange: (isManual: boolean) => void;  
  
  // Loading state
  disabled?: boolean;
}

export default function VenueSelector({
  venueName,
  address,
  placeId,
  bypassAddressValidation, 
  onVenueChange,
  onVenueNameChange,
  onAddressChange,
  onManualModeChange, 
  disabled = false
}: VenueSelectorProps) {
  
  const venueInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [status, setStatus] = useState<string>('');
  // const [useManualEntry, setUseManualEntry] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(bypassAddressValidation);

  // Define handlePlaceSelect first (before useEffect that uses it)
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

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Define callback function
      window.initGoogleMaps = () => {
        // Double check that places library is loaded
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

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (isGoogleLoaded && venueInputRef.current && !autocompleteRef.current) {
      try {
        // Additional safety check
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          setStatus('Google Maps Places library not ready');
          return;
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          venueInputRef.current,
          {
            types: ['establishment'],
            fields: ['place_id', 'name', 'formatted_address', 'geometry']
          }
        );

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        setStatus('Venue search ready');
      } catch (error) {
        setStatus('Error initializing venue search');
        console.error('Autocomplete initialization error:', error);
      }
    }
  }, [isGoogleLoaded, handlePlaceSelect]);

  const handleVenueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onVenueNameChange(value);
    
    // If user manually types after selecting a place, clear the selection
    if (selectedPlace && value !== selectedPlace.name) {
      setSelectedPlace(null);
      setStatus('Venue modified. Search for suggestions or use Reset to start over.');
    }
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddressChange(e.target.value);
  };

  const resetFields = () => {
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
    
    if (venueInputRef.current) {
      venueInputRef.current.focus();
    }
  };

  const handleManualToggle = (checked: boolean) => {
  setUseManualEntry(checked);
  onManualModeChange(checked);
  
  if (checked) {
    // Switching to manual mode - clear Google data
    setSelectedPlace(null);
    setStatus('');
  } else {
    // Switching back to Google mode - clear manual entries and reset
    resetFields();
  }
};

  const hasContent = venueName.length > 0 || address.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Venue & Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status indicator */}
        {/* {status && ( */}
        {false && status && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            {status}
          </div>
        )}

        {/* Venue field with autocomplete original */}
        {/* <div>
          <label className="block text-sm font-medium mb-2">Venue</label>
          <Input
            ref={venueInputRef}
            placeholder="Start typing a venue name..."
            value={venueName}
            onChange={handleVenueInputChange}
            disabled={disabled || !isGoogleLoaded}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isGoogleLoaded ? 'Type to search venues' : 'Loading venue search...'}
          </p>
        </div> */}

        {/* Manual entry checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="manual-entry"
            checked={useManualEntry}
            onChange={(e) => handleManualToggle(e.target.checked)}
            disabled={disabled}
            className="rounded border-gray-300"
          />
          <label htmlFor="manual-entry" className="text-sm font-medium">
            Enter venue / address manually
          </label>
        </div>

        {/* Warning for manual entry */}
        {useManualEntry && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <strong className="text-yellow-800">Warning:</strong> 
            <span className="text-yellow-700"> Manually entered venues/addresses will disable map services. 
            Only use this option if your venue is not accessible via the lookup above. 
            You can add enhanced location details in your event description (e.g., quoteMark east rink near 5th Ave quoteMark). 
            Uncheck the box to return to Google venue lookup.</span>
          </div>
        )}

        {/* Venue field - conditional behavior */}
        <div>
          <label className="block text-sm font-medium mb-2">Venue</label>
          <Input
            ref={useManualEntry ? null : venueInputRef}
            placeholder={useManualEntry ? "Enter venue name manually" : "Start typing a venue name..."}
            value={venueName}
            onChange={handleVenueInputChange}
            disabled={disabled || (!useManualEntry && !isGoogleLoaded)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {useManualEntry 
              ? 'Manual entry - no autocomplete' 
              : (isGoogleLoaded ? 'Type to search venues' : 'Loading venue search...')
            }
          </p>
        </div>

        {/* Address field */}
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          {/* <Input
            placeholder="Address will populate automatically..."
            value={address}
            onChange={handleAddressInputChange}
            disabled={disabled}
          /> */}

          <Input
            placeholder={useManualEntry ? "Enter address manually" : "Address will populate automatically..."}
            value={address}
            onChange={handleAddressInputChange}
            disabled={disabled}
            readOnly={!useManualEntry}
          />

          {/* <p className="text-xs text-muted-foreground mt-1">
            Editable - will auto-fill when venue is selected
          </p> */}

          <p className="text-xs text-muted-foreground mt-1">
            {useManualEntry 
              ? 'Manual entry - no validation' 
              : 'Auto-fills when venue is selected'
            }
          </p>
        </div>

        {/* Reset button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetFields}
          disabled={disabled || !hasContent}
        >
          Reset Address
        </Button>

        {/* Debug info in development */}
        {/* {process.env.NODE_ENV === 'development' && placeId && ( */}
        {false && process.env.NODE_ENV === 'development' && placeId && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Debug:</strong> Place ID: {placeId}
          </div>
        )}

      </CardContent>
    </Card>
  );
}