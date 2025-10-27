
// Direct exports from core with type keyword to avoid ambiguities
export * from './core/auth';
export * from './video-conference';
export * from './rbac-tests';
export * from './rbac-integrity';
export * from './rbac-monitoring';
export * from './session/note';
export * from './adapters/rbac';

// Handle specific re-exports using export type to avoid conflicts
export type { UserRole, RoleActionType } from './core/rbac';
export type { RoleEvent } from './core/rbac';
export type { RoleConflict, RBACHealthStatus } from './utils/rbac/types';
export type { RBACQueryResponse, RBACPerformanceMetrics } from './utils/rbac/types';
export type { ConsistencyCheckResult, CheckOptions } from './utils/rbac/types';
export type { ConnectionQuality } from './core/rbac';
export type { RBACStats } from './core/rbac';
export type { RoleBreakdownItem } from './core/rbac';
export type { RBACTest, OperationTest, TestStatus } from './utils/rbac/types';
export type { RoleDiagnosticResult, SecurityAlert } from './core/rbac';
export type { RBACEvent } from './core/rbac';
