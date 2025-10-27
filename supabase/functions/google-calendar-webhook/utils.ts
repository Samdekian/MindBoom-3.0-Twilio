
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  options: RetryOptions = { maxRetries: 3, initialDelay: 1000, backoffFactor: 2 }
): Promise<T> {
  const { maxRetries, initialDelay, backoffFactor } = options;
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = initialDelay * Math.pow(backoffFactor, attempt);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
