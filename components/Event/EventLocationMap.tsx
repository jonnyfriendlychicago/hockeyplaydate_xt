// components/Event/EventLocationMap.tsx

// devNote: 2025aug31: google maps is providing a proactive error on our mapping solution, which is displayed in browswer >> application >> console, listed below. 
// Plan/design for transitioning to newer supported mapping solution is undetermined  at this time.  
// This is an issue to be addressed in near future. 

    /*
    The signature '(opts?: MarkerOptions | null | undefined): Marker' of 'window.google.maps.Marker' is deprecated.ts(6387)
    index.d.ts(4857, 8): The declaration was marked as deprecated here.
    constructor google.maps.Marker(opts?: google.maps.MarkerOptions | null | undefined): google.maps.Marker
    Access by calling const {Marker} = await google.maps.importLibrary("marker"). See https://developers.google.com/maps/documentation/javascript/libraries.

    @param opts — Named optional arguments

    @deprecated
    As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
    */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Copy } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface EventLocationMapProps {
  venueName: string | null;
  address: string | null;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
  bypassAddressValidation: boolean;
}

// export default function EventLocationMap({
export function EventLocationMap({
  venueName,
  address,
  placeId,
  lat,
  lng,
  bypassAddressValidation
}: EventLocationMapProps) {
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMaps = () => {
        if (window.google && window.google.maps) {
          setIsGoogleLoaded(true);
        }
      };
      
      document.head.appendChild(script);
    } else if (window.google && window.google.maps) {
      setIsGoogleLoaded(true);
    }
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (isGoogleLoaded && mapRef.current && lat && lng && !mapInstanceRef.current) {
      try {
        const mapOptions = {
          center: { lat, lng },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

        // Add marker
        new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: venueName || 'Event Location',
        });

      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    }
  }, [isGoogleLoaded, lat, lng, venueName]);

  // orig function, which failed in mobile experience 
  // const handleGetDirections = () => {
  //   const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
  //   // Use Place ID for rich place experience, fallback to address search
  //   const mapsUrl = placeId 
  //     ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
  //     : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
    
  //   if (isMobile) {
  //     window.open(mapsUrl, '_self');
  //   } else {
  //     window.open(mapsUrl, '_blank');
  //   }
  // };

  // new function, try1
  const handleGetDirections = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    let mapsUrl;
    if (placeId && address) {
      // Use the official Google Maps URLs format with both query and place ID
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${placeId}`;
    } else if (address) {
      // Fallback for manual entries
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    } else {
      return; // No valid location data
    }
    
    if (isMobile) {
      window.open(mapsUrl, '_self');
    } else {
      window.open(mapsUrl, '_blank');
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // No location data available
  if (!venueName && !address) {
    return (
      <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No location provided</p>
      </div>
    );
  }

  // Manual entry mode - show address text only
  if (bypassAddressValidation || !lat || !lng) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md">
          {venueName && (
            <p className="font-medium text-sm">{venueName}</p>
          )}
          {address && (
            <p className="text-sm text-muted-foreground">{address}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGetDirections}
            size="sm"
            className="flex-1"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Get Directions
          </Button>
          
          {address && (
            <Button 
              onClick={handleCopyAddress}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copySuccess ? 'Copied!' : 'Copy Address'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // API mode - show interactive map
  return (
    <div className="space-y-4">
      <div
        ref={mapRef}
        className="h-48 bg-gray-100 rounded-md"
      >
        {!isGoogleLoaded && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleGetDirections}
          size="sm"
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-1" />
          Get Directions
        </Button>
        
        {address && (
          <Button 
            onClick={handleCopyAddress}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-1" />
            {copySuccess ? 'Copied!' : 'Copy'}
          </Button>
        )}
      </div>
    </div>
  );
}