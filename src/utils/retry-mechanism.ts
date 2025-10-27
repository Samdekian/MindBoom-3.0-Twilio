
/**
 * Utility for retrying operations with exponential backoff
 * @param operation - The operation to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param initialDelay - Initial delay in milliseconds
 * @param backoffFactor - Factor to multiply delay by after each attempt
 * @returns The result of the operation
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  backoffFactor: number = 2
): Promise<T> {
  let lastError: Error | null = null;
  let currentDelay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If this is a retry attempt, wait before trying again
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffFactor; // Exponential backoff
      }
      
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, lastError);
      
      // If we've reached max retries, throw the last error
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }
  
  // This should never be reached due to the throw in the loop,
  // but TypeScript needs it for type safety
  throw lastError || new Error("Unknown error in retry mechanism");
}
