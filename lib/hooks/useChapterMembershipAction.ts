// lib/hooks/useChapterMembershipAction.ts

import { useState } from 'react';
import { ActionResult } from '@/lib/types/serverActionResults';
import { setChapterError } from './useChapterMembershipError'; 
import { ChapterErrorKey } from '@/lib/constants/errorKeys';

/**
 * Configuration options for useChapterMembershipAction hook
 */
interface UseChapterMembershipActionOptions {
  /**
   * Error key for storing errors in sessionStorage
   * If provided, errors will be persisted for ChapterErrorDisplay
   */
  errorKey?: ChapterErrorKey;
  
  /**
   * Callback executed on successful action completion
   */
  onSuccess?: () => void;
  
  /**
   * Callback executed on action failure
   * @param error - The error message from the action
   */
  onError?: (error: string) => void;
  
  /**
   * Custom error message to display instead of the one from the action
   */
  defaultErrorMessage?: string;
}

/**
 * Return type for useChapterMembershipAction hook
 */
interface UseChapterMembershipActionReturn {
  /**
   * Execute a server action with automatic error handling and loading states
   * @param action - The server action function to execute
   * @param data - Object containing form data fields
   * @returns Promise that resolves when action completes
   */
  executeAction: (
    action: (formData: FormData) => Promise<ActionResult>,
    data: Record<string, string>
  ) => Promise<void>;
  
  /**
   * Whether an action is currently being executed
   */
  isSubmitting: boolean;
  
}

/**
 * Custom hook for executing chapter membership server actions with consistent error handling
 * 
 * This hook abstracts away the common patterns of:
 * - Managing loading/submitting state
 * - Creating FormData objects
 * - Handling action success/failure
 * - Detecting and allowing Next.js redirects
 * - Persisting errors to sessionStorage for ChapterErrorDisplay
 * 
 * Use this for: join chapter, leave chapter, cancel join request, update member role
 * 
 * @example
 * // In a modal component
 * const { executeAction, isSubmitting } = useChapterMembershipAction({
 *   errorKey: CHAPTER_ERROR_KEYS.LEAVE_CHAPTER,
 *   onSuccess: () => {
 *     setConfirmText('');
 *     onClose();
 *   }
 * });
 * 
 * const handleSubmit = async () => {
 *   await executeAction(leaveChapterAction, { chapterSlug });
 * };
 * 
 * @example
 * // In an inline form (no local error display)
 * const { executeAction, isSubmitting } = useChapterMembershipAction({
 *   errorKey: CHAPTER_ERROR_KEYS.JOIN_CHAPTER
 * });
 * 
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   await executeAction(joinChapterAction, { chapterSlug });
 * };
 */

export function useChapterMembershipAction(
  options: UseChapterMembershipActionOptions = {}
): UseChapterMembershipActionReturn {
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
          setChapterError(errorKey, errorMessage);
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
      
      // Note: Don't set isSubmitting to false here
      // If action redirects, component will unmount anyway
      // If action doesn't redirect, finally block will handle it

    } catch (error) {
      // Allow Next.js redirects to propagate
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }

      // Handle unexpected errors
      console.error('Chapter membership action execution error:', error);
      
      const errorMessage = defaultErrorMessage;
      // setError(errorMessage);
      
      if (errorKey) {
        setChapterError(errorKey, errorMessage);
      }
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsSubmitting(false);
    } finally {
      // Only reset loading state if we haven't already
      // (happens when action fails or throws non-redirect error)
      setIsSubmitting(false);
    }
  };

  return {
    executeAction,
    isSubmitting,
  };
}