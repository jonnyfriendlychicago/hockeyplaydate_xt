// lib/hooks/useRsvpError.ts

import { useState, useEffect } from 'react';
import { RsvpErrorKey } from '@/lib/constants/errorKeys';

/**
 * Set an RSVP error in sessionStorage
 */
export function setRsvpError(key: RsvpErrorKey, message: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, message);
    window.dispatchEvent(new CustomEvent('rsvpError', { 
      detail: { key, message } 
    }));
  }
}

/**
 * Clear an RSVP error from sessionStorage
 */
export function clearRsvpError(key: RsvpErrorKey): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(key);
  }
}

/**
 * Get an RSVP error from sessionStorage
 */
export function getRsvpError(key: RsvpErrorKey): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(key);
  }
  return null;
}

/**
 * Custom React hook for managing component-level RSVP errors
 */
export function useRsvpError(key: RsvpErrorKey): [
  string | null,
  (value: string | null) => void
] {
  const [error, setErrorState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        sessionStorage.removeItem(key);
        return saved;
      }
    }
    return null;
  });

  const setError = (value: string | null) => {
    setErrorState(value);
    
    if (typeof window !== 'undefined') {
      if (value) {
        sessionStorage.setItem(key, value);
      } else {
        sessionStorage.removeItem(key);
      }
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setErrorState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [error, setError];
}