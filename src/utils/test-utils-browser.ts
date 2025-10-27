
// @vitest-only
/**
 * Browser-safe testing utilities
 * These utilities provide a safe interface for code that might be imported
 * in both test and browser environments, preventing Vitest errors.
 */

// Re-export types from testing libraries for type checking
export type { RenderResult } from '@testing-library/react';

// Define our own Mock type to avoid Jest dependencies in browser
export interface MockFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  mockClear: () => MockFunction<T>;
  mockReset: () => MockFunction<T>;
  mockRestore: () => MockFunction<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockImplementationOnce: (fn: T) => MockFunction<T>;
  mockReturnValue: (val: ReturnType<T>) => MockFunction<T>;
  mockReturnValueOnce: (val: ReturnType<T>) => MockFunction<T>;
  mockResolvedValue: (val: Awaited<ReturnType<T>>) => MockFunction<T>;
  mockResolvedValueOnce: (val: Awaited<ReturnType<T>>) => MockFunction<T>;
  mockRejectedValue: (val: any) => MockFunction<T>;
  mockRejectedValueOnce: (val: any) => MockFunction<T>;
  getMockName: () => string;
  mockName: (name: string) => MockFunction<T>;
  mock: {
    calls: Parameters<T>[];
    instances: any[];
    results: { type: 'return' | 'throw', value: any }[];
    contexts: any[];
  };
  withImplementation: (fn: T, cb: () => Promise<void>) => Promise<void>;
  _isMockFunction: boolean;
  _original: T | undefined;
  logStringMismatchWarning: (value: string) => void;
  alias: (...aliases: string[]) => MockFunction<T>;
}

// Safe mock functions that work in browser
export const mockFn = <T extends (...args: any[]) => any>(
  ...args: any[]
): MockFunction<T> => {
  return {
    mockClear: () => mockFn(),
    mockReset: () => mockFn(),
    mockRestore: () => mockFn(),
    mockImplementation: (fn) => mockFn(),
    mockImplementationOnce: (fn) => mockFn(),
    mockReturnValue: (val) => mockFn(),
    mockReturnValueOnce: (val) => mockFn(),
    mockResolvedValue: (val) => mockFn(),
    mockResolvedValueOnce: (val) => mockFn(),
    mockRejectedValue: (val) => mockFn(),
    mockRejectedValueOnce: (val) => mockFn(),
    getMockName: () => '',
    mockName: (name) => mockFn(),
    mock: { calls: [], instances: [], results: [], contexts: [] },
    withImplementation: (fn, cb) => Promise.resolve(),
    _isMockFunction: true,
    _original: undefined,
    logStringMismatchWarning: (value) => {},
    alias: (...aliases) => mockFn()
  } as unknown as MockFunction<T>;
};

// Safe implementation for test utilities
export const safeTestUtils = {
  render: () => ({ container: document.createElement('div') }),
  cleanup: () => {},
  fireEvent: {
    click: () => false,
    change: () => false,
    focus: () => false,
    blur: () => false,
    submit: () => false,
  },
  waitFor: async () => {},
  screen: {
    getByText: () => document.createElement('div'),
    queryByText: () => null,
    getByTestId: () => document.createElement('div'),
    queryByTestId: () => null,
  },
};

// Export a function to check if we're in a test environment
export const isTestEnvironment = () => {
  return typeof process !== 'undefined' && 
    process.env && 
    (process.env.NODE_ENV === 'test' || 
     process.env.VITEST ||
     process.env.JEST_WORKER_ID);
};

// Mark this module as test-only
if (!isTestEnvironment()) {
  console.warn('test-utils-browser imported outside test environment');
}
