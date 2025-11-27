
// @vitest-only
// This file provides a safe implementation of testing-library hooks
// that won't cause issues when imported in browser environments

// Use type imports to avoid actual code imports in browser
import type { RenderHookResult } from '@testing-library/react-hooks';

// Define a properly typed mock result object
export interface MockRenderResult<T> {
  current: T;
  all: T[];
}

// Create a browser-safe mock of renderHook
export function renderHook<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: any
): RenderHookResult<TResult, TProps> {
  // This is a simplified mock that will be replaced by the actual implementation in tests
  console.warn('Using mock renderHook - this should only happen in browser environments');
  
  // Create a properly typed mock result
  const mockResult: MockRenderResult<TResult> = {
    current: null as unknown as TResult,
    all: []
  };
  
  // Create the result object
  const result = {
    result: mockResult,
    waitForNextUpdate: async () => {},
    waitFor: async () => {},
    waitForValueToChange: async () => {},
    unmount: () => {},
    rerender: (_props?: TProps) => {}
  };
  
  // Use double type assertion to avoid direct conversion
  return (result as unknown) as RenderHookResult<TResult, TProps>;
}

// Create a browser-safe mock of act
export const act = async (callback: () => Promise<void> | void): Promise<void> => {
  if (typeof callback === 'function') {
    await callback();
  }
};

// Export a dummy default to ensure this is treated as a module
export default { renderHook, act };
