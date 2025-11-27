/**
 * Type adapters for RBAC functionality
 */

import { UserRole, RoleEvent, SecurityAlert, ExtendedUserRole } from '@/types/core/rbac';
import { safeJsonAccess, safeJsonToObject } from '@/utils/json-utils';

/**
 * Checks if the provided role string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['admin', 'therapist', 'patient', 'support'];
  return validRoles.includes(role as UserRole);
}

/**
 * Converts a string to UserRole or null
 * Returns null for invalid roles
 */
export function asUserRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  
  const validRoles: UserRole[] = ['admin', 'therapist', 'patient', 'support'];
  
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  
  return null;
}

/**
 * Converts an array of strings to an array of UserRole
 * Filters out invalid roles
 */
export function asUserRoles(roles: string[]): UserRole[] {
  const validRoles: UserRole[] = ['admin', 'therapist', 'patient', 'support'];
  
  return roles.filter(role => validRoles.includes(role as UserRole)) as UserRole[];
}

/**
 * Normalizes a role change event from various sources into a standard format
 */
export function normalizeRoleChangeEvent(event: any): RoleEvent {
  const metadata = safeJsonToObject(event.metadata) || {};
  
  return {
    id: event.id || `event-${Date.now()}`,
    user_id: event.user_id || event.userId || '',
    userId: event.user_id || event.userId || '',
    userName: event.user_name || event.userName || safeJsonAccess(metadata, 'userName', 'Unknown User'),
    timestamp: event.timestamp || event.created_at || new Date().toISOString(),
    actionType: event.action_type || event.actionType || 'assigned',
    action: event.action_type || event.actionType || 'assigned',
    role: event.role || safeJsonAccess(metadata, 'role', 'patient'),
    performedBy: event.performed_by || event.performedBy || safeJsonAccess(metadata, 'performedBy', ''),
    performedByName: event.performed_by_name || event.performedByName || safeJsonAccess(metadata, 'performedByName', ''),
    actor_id: event.performed_by || safeJsonAccess(metadata, 'performedBy', undefined),
    reason: safeJsonAccess(metadata, 'reason', undefined)
  };
}

/**
 * Normalizes a security alert from various sources into a standard format
 */
export function normalizeSecurityAlert(event: any): SecurityAlert {
  const metadata = safeJsonToObject(event.metadata) || {};
  
  return {
    id: event.id || `alert-${Date.now()}`,
    userId: event.user_id || event.userId || '',
    userName: event.user_name || event.userName || safeJsonAccess(metadata, 'userName', 'Unknown User'),
    timestamp: event.activity_timestamp || event.timestamp || event.created_at || new Date().toISOString(),
    alertType: safeJsonAccess(metadata, 'alertType', 'security_warning'),
    severity: safeJsonAccess(metadata, 'severity', 'medium'),
    description: safeJsonAccess(metadata, 'description', 'Security alert detected'),
    message: safeJsonAccess(metadata, 'message', safeJsonAccess(metadata, 'description', 'Security alert detected')),
    isResolved: safeJsonAccess(metadata, 'resolved', false),
    resolvedAt: safeJsonAccess(metadata, 'resolvedAt', undefined),
    resolvedBy: safeJsonAccess(metadata, 'resolvedBy', undefined),
    relatedEvents: safeJsonAccess(metadata, 'relatedEvents', []),
    type: safeJsonAccess(metadata, 'type', 'suspicious_activity'),
    metadata: metadata,
    resolved: safeJsonAccess(metadata, 'resolved', false), // for compatibility
  };
}

/**
 * Safe converter for JSON to record
 * For backward compatibility
 */
export function safeJsonToRecord(json: any): Record<string, any> {
  return safeJsonToObject(json) || {};
}

/**
 * Safe converter for security alert
 * For backward compatibility
 */
export function adaptSecurityAlert(alert: any): SecurityAlert {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    timestamp: alert.timestamp,
    userId: alert.userId || alert.user_id,
    resolved: alert.resolved || false,
    isResolved: alert.isResolved || false,
    metadata: alert.metadata || {},
    alertType: alert.alertType,
    description: alert.description,
    userName: alert.userName,
    resolvedAt: alert.resolvedAt,
    resolvedBy: alert.resolvedBy,
    relatedEvents: alert.relatedEvents || [],
  };
}

// Re-export json access utilities for backward compatibility
export { safeJsonAccess, safeJsonToObject };
