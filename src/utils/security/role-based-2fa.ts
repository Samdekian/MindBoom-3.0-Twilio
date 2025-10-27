
import { UserRole } from "@/types/core/rbac";

// Define which roles require 2FA
const ROLES_REQUIRING_2FA: UserRole[] = ['admin', 'therapist'];

// Default minimum security level requiring 2FA
const DEFAULT_MIN_SECURITY_LEVEL = 'medium';

/**
 * Configuration for role-based 2FA requirements
 */
export interface TwoFactorRequirements {
  enabled: boolean;
  requiredForRoles: UserRole[];
  requiredForSecurityLevels: string[];
  requiredForSensitiveOperations: boolean;
  gracePeriodsEnabled: boolean;
  graceHours: number;
}

// Default 2FA configuration
export const DEFAULT_2FA_CONFIG: TwoFactorRequirements = {
  enabled: true,
  requiredForRoles: ROLES_REQUIRING_2FA,
  requiredForSecurityLevels: ['high', 'critical'],
  requiredForSensitiveOperations: true,
  gracePeriodsEnabled: true,
  graceHours: 72 // 3 days
};

/**
 * Check if a user needs to set up 2FA based on their roles
 */
export function requires2FA(userRoles: UserRole[], config: TwoFactorRequirements = DEFAULT_2FA_CONFIG): boolean {
  if (!config.enabled) return false;
  
  return userRoles.some(role => config.requiredForRoles.includes(role));
}

/**
 * Check if a user has completed their 2FA grace period
 */
export function isGracePeriodExpired(
  roleAssignmentDate: Date, 
  config: TwoFactorRequirements = DEFAULT_2FA_CONFIG
): boolean {
  if (!config.gracePeriodsEnabled) return true;
  
  const now = new Date();
  const graceEndTime = new Date(roleAssignmentDate);
  graceEndTime.setHours(graceEndTime.getHours() + config.graceHours);
  
  return now > graceEndTime;
}

/**
 * Check if an operation requires 2FA based on resource and action
 */
export function operationRequires2FA(
  resourceType: string, 
  action: string,
  securityLevel: string = DEFAULT_MIN_SECURITY_LEVEL,
  config: TwoFactorRequirements = DEFAULT_2FA_CONFIG
): boolean {
  if (!config.enabled) return false;
  
  // Check if operation has required security level
  if (config.requiredForSecurityLevels.includes(securityLevel)) {
    return true;
  }
  
  // Define sensitive operations that always require 2FA
  const sensitiveOperations = [
    { resource: 'user_roles', action: 'assign' },
    { resource: 'user_roles', action: 'remove' },
    { resource: 'permissions', action: 'assign' },
    { resource: 'permissions', action: 'remove' },
    { resource: 'profiles', action: 'delete' },
    { resource: 'medical_records', action: 'delete' },
    { resource: 'billing', action: 'charge' },
    { resource: 'security_settings', action: 'update' }
  ];
  
  if (config.requiredForSensitiveOperations) {
    return sensitiveOperations.some(op => 
      op.resource === resourceType && op.action === action
    );
  }
  
  return false;
}
