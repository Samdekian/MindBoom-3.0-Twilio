
// @vitest-only
// This file serves as an entry point for RBAC verification tests
// It imports and re-exports the test files to maintain backward compatibility

import './permission-tests';
import './role-consistency-tests';

// Export for compatibility
export * from './utils/mock-utils';
export * from './utils/supabase-mock';
