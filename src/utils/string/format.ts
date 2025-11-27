
/**
 * String formatting utilities
 */

// Capitalize the first letter of a string
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format camelCase to Title Case with spaces
export function formatCamelToTitle(camelCase: string): string {
  if (!camelCase) return '';
  
  // Add space before uppercase letters and capitalize the first letter
  const withSpaces = camelCase.replace(/([A-Z])/g, ' $1');
  return capitalizeFirst(withSpaces);
}

// Format snake_case to Title Case with spaces
export function formatSnakeToTitle(snakeCase: string): string {
  if (!snakeCase) return '';
  
  // Replace underscores with spaces and capitalize each word
  return snakeCase
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

// Truncate a string with ellipsis if it's too long
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.slice(0, maxLength) + '...';
}

// Safely stringify an object for display
export function safeStringify(obj: any, indent = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (e) {
    return String(obj);
  }
}
