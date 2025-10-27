// lib/hooks/useChapterMembershipError.ts

// devNotes: 2025oct25: this file (and related imports in other files) needs to be renamed: useChapterMembershipError.ts
// TODO: Rename useChapterError.ts → useChapterMembershipError.ts
// - Update imports in 5 files:
//   - JoinChapterButton.tsx
//   - LeaveChapterModal.tsx
//   - ChapterMemberManagementModal.tsx
//   - MembershipTabClient.tsx
//   - useChapterMembershipAction.ts

// devNotes: 2025oct24: this file used by chapter server actions file (root/slug/actions.ts)

import { useState, useEffect } from 'react';
import { ChapterErrorKey } from '@/lib/constants/errorKeys';

/**
 * Set a chapter error in sessionStorage
 * This will be picked up by ChapterErrorDisplay or component-specific error handlers
 * 
 * @param key - The error key from CHAPTER_ERROR_KEYS
 * @param message - The error message to display
 */
export function setChapterError(key: ChapterErrorKey, message: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, message);
    // Dispatch custom event so ChapterErrorDisplay can react immediately
    window.dispatchEvent(new CustomEvent('chapterError', { 
      detail: { key, message } 
    }));
  }
}

/**
 * Clear a chapter error from sessionStorage
 * 
 * @param key - The error key from CHAPTER_ERROR_KEYS
 */
export function clearChapterError(key: ChapterErrorKey): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(key);
  }
}

/**
 * Get a chapter error from sessionStorage
 * 
 * @param key - The error key from CHAPTER_ERROR_KEYS
 * @returns The error message or null
 */
export function getChapterError(key: ChapterErrorKey): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(key);
  }
  return null;
}

/**
 * Custom React hook for managing component-level chapter errors
 * Handles reading from sessionStorage on mount and persisting on updates
 * 
 * @param key - The error key from CHAPTER_ERROR_KEYS
 * @returns [error, setError] tuple similar to useState
 * 
 * @example
 * const [error, setError] = useChapterError(CHAPTER_ERROR_KEYS.LEAVE_CHAPTER);
 * 
 * // Set an error (will persist to sessionStorage)
 * setError('Unable to leave chapter');
 * 
 * // Clear the error
 * setError(null);
 */
export function useChapterError(key: ChapterErrorKey): [
  string | null,
  (value: string | null) => void
] {
  // Initialize state by reading from sessionStorage
  const [error, setErrorState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        // Clear it immediately after reading so it doesn't persist across page reloads
        sessionStorage.removeItem(key);
        return saved;
      }
    }
    return null;
  });

  // Wrapper function that persists to sessionStorage
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

  // Optional: Listen for storage events from other tabs/windows
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