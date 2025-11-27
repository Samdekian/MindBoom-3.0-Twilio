
import { describe, it, expect } from 'vitest';
import { calendarCache } from "@/utils/calendar-data-cache";

// Mock some test that uses calendarCache.remove
describe('Calendar Cache', () => {
  it('invalidates cache properly', () => {
    // Instead of:
    // calendarCache.invalidate('test-key');
    
    // Use:
    calendarCache.remove('test-key');
  });
});
