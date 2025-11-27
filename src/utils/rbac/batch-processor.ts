
/**
 * Process items in batches, useful for bulk role operations
 * @param items Array of items to process
 * @param batchSize Number of items to process at once
 * @param processFn Function to process each batch
 * @param onProgress Optional progress callback
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<R[]>,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const totalItems = items.length;
  let processedItems = 0;
  
  // Process in batches to avoid overloading the database
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processFn(batch);
    results.push(...batchResults);
    
    // Update progress
    processedItems += batch.length;
    if (onProgress) {
      onProgress(processedItems, totalItems);
    }
  }
  
  return results;
}

/**
 * Process items in parallel batches with limited concurrency
 * @param items Array of items to process
 * @param processFn Function to process each item
 * @param concurrency Maximum number of parallel operations
 * @param onProgress Optional progress callback
 */
export async function processParallel<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  concurrency: number = 5,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const totalItems = items.length;
  let processedItems = 0;
  
  // Process items with limited concurrency
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const promises = batch.map(item => processFn(item));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Update progress
    processedItems += batch.length;
    if (onProgress) {
      onProgress(processedItems, totalItems);
    }
  }
  
  return results;
}

/**
 * Split processing into background tasks
 * @param items Array of items to process
 * @param processFn Function to process each item
 * @param onComplete Callback when all processing completes
 */
export function processInBackground<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  onComplete?: (results: R[]) => void
): { cancel: () => void } {
  let canceled = false;
  const results: R[] = [];
  
  // Start processing in the background
  (async () => {
    for (const item of items) {
      if (canceled) break;
      
      try {
        const result = await processFn(item);
        results.push(result);
      } catch (error) {
        console.error("Error in background processing:", error);
      }
    }
    
    if (!canceled && onComplete) {
      onComplete(results);
    }
  })();
  
  return {
    cancel: () => { canceled = true; }
  };
}
