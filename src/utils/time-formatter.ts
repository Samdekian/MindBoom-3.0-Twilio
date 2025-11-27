
/**
 * Formats a time string in HH:MM format to AM/PM format
 * @param time Time string in format HH:MM
 * @returns Formatted time string in AM/PM format
 */
export const formatTimeToAmPm = (time: string): string => {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time; // Return original if parsing fails
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original on error
  }
}

/**
 * Formats a date object to a friendly string format
 * @param date Date object
 * @returns Formatted date string
 */
export const formatDateToFriendlyString = (date: Date): string => {
  if (!date) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a time string in ISO format to AM/PM format
 * @param isoString ISO date string
 * @returns Time in AM/PM format
 */
export const formatISOTimeToAmPm = (isoString: string): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      return ''; // Return empty if invalid date
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting ISO time:', error);
    return ''; // Return empty on error
  }
}

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format a Date to day name (e.g. "Monday")
 * @param date The date to format
 * @returns The day name as a string
 */
export const formatDayName = (date: Date): string => {
  if (!date) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long'
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a Date object to a time string
 * @param date The date to format
 * @returns Formatted time string in AM/PM format
 */
export const formatTimeFromDate = (date: Date): string => {
  if (!date) return '';
  
  try {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time from date:', error);
    return ''; // Return empty on error
  }
};
