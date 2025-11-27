
/**
 * Safely converts a JSON string or object to a typed object
 * Handles potential parsing errors
 */
export function safeJsonToObject<T = any>(data: any): T | null {
  if (data === null || data === undefined) {
    return null;
  }
  
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as T;
    } else {
      // If it's already an object, return it directly
      return data as T;
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

/**
 * Safely access nested properties in an object with a default value
 */
export function safeJsonAccess<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return (current === undefined || current === null) ? defaultValue : current as T;
}
