
/**
 * Safely extract the error message from any error type
 * @param error The error object or unknown value to extract message from
 * @returns A string representation of the error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Creates a typed error object from an unknown error
 * @param error The error to transform
 * @param defaultMessage Default message if none can be extracted
 * @returns Error object with message
 */
export function createTypedError(error: unknown, defaultMessage = 'An error occurred'): Error {
  if (error instanceof Error) {
    return error;
  }
  
  return new Error(getErrorMessage(error) || defaultMessage);
}
