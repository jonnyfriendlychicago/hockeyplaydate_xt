// lib/helpers/handleFieldErrorsFromServer.ts

import { FieldValues, UseFormReturn, Path } from 'react-hook-form';

/**
 * Applies field-level errors from an API response to a React Hook Form instance.
 * Expects the backend to return: { issues: [{ field: string, message: string }] }
 */
export function handleFieldErrorsFromServer<T extends FieldValues>(
  form: UseFormReturn<T>,
  errorPayload: { issues?: { field: string; message: string }[] }
): void {
  if (Array.isArray(errorPayload?.issues)) {
    for (const issue of errorPayload.issues) {
      form.setError(issue.field as Path<T>, {
        type: 'server',
        message: issue.message,
      });
    }
  } else {
    console.error('Unexpected error format from server:', errorPayload);
  }
}
