// lib/types/serverActionResults.ts

/**
 * Standard return type for all server actions
 * Ensures type safety and consistent error handling across the application
 */
export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Helper function to create successful action results
 * Usage: return success() or return success({ eventId: 123 })
 */
export function success<T = void>(data?: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Helper function to create failed action results
 * Usage: return failure('Invalid request data')
 */
export function failure(error: string): ActionResult<never> {
  return { success: false, error };
}