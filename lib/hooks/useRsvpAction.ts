// lib/hooks/useRsvpAction.ts

import { useState } from 'react';
import { ActionResult } from '@/lib/types/serverActionResults';
import { setRsvpError } from './useRsvpError'; 
import { RsvpErrorKey } from '@/lib/constants/errorKeys';

/**
 * Configuration options for useRsvpAction hook
 */
interface UseRsvpActionOptions {
  /**
   * Error key for storing errors in sessionStorage
   */
  errorKey?: RsvpErrorKey;
  
  /**
   * Callback executed on successful action completion
   */
  onSuccess?: () => void;
  
  /**
   * Callback executed on action failure
   */
  onError?: (error: string) => void;
  
  /**
   * Custom error message to display instead of the one from the action
   */
  defaultErrorMessage?: string;
}

/**
 * Return type for useRsvpAction hook
 */
interface UseRsvpActionReturn {
  executeAction: (
    action: (formData: FormData) => Promise<ActionResult>,
    data: Record<string, string>
  ) => Promise<void>;
  
  isSubmitting: boolean;
}

/**
 * Custom hook for executing RSVP server actions with consistent error handling
 * 
 * Mirrors useChapterMembershipAction pattern for RSVP operations
 */
export function useRsvpAction(
  options: UseRsvpActionOptions = {}
): UseRsvpActionReturn {
  const {
    errorKey,
    onSuccess,
    onError,
    defaultErrorMessage = 'Something went wrong. Please try again.'
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeAction = async (
    action: (formData: FormData) => Promise<ActionResult>,
    data: Record<string, string>
  ): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Build FormData from provided object
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Execute the server action
      const result = await action(formData);

      // Handle action failure
      if (result && !result.success) {
        const errorMessage = result.error || defaultErrorMessage;
        
        // Persist to sessionStorage if errorKey provided
        if (errorKey) {
          setRsvpError(errorKey, errorMessage);
        }
        
        // Call error callback if provided
        if (onError) {
          onError(errorMessage);
        }
        
        setIsSubmitting(false);
        return;
      }

      // Handle action success
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      // Allow Next.js redirects to propagate
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }

      // Handle unexpected errors
      console.error('RSVP action execution error:', error);
      
      const errorMessage = defaultErrorMessage;
      
      if (errorKey) {
        setRsvpError(errorKey, errorMessage);
      }
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    executeAction,
    isSubmitting,
  };
}