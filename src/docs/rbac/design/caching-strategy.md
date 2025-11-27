
# Caching Strategy for Roles and Permissions

## Overview

An effective caching strategy is essential for optimizing the performance of our unified AuthRBAC system. This document outlines the approach to caching roles and permissions to minimize database queries and improve user experience.

## Caching Objectives

1. **Reduce Database Queries**: Minimize calls to the database for role and permission data
2. **Improve Response Times**: Provide immediate access to role and permission information
3. **Ensure Data Freshness**: Maintain reasonably up-to-date role information
4. **Handle Edge Cases**: Deal with concurrent sessions and role changes
5. **Support Offline Usage**: Allow limited functionality when offline

## Cache Levels

### 1. In-Memory Cache

- **Storage**: React state within AuthRBACProvider
- **Lifetime**: Component lifecycle
- **Use Cases**: Active user session
- **Implementation**: Using `useState` and `useMemo` hooks
- **Invalidation**: On auth state change, manual refresh, or TTL expiration

### 2. Session Storage Cache

- **Storage**: Browser's sessionStorage
- **Lifetime**: Browser tab session
- **Use Cases**: Page refreshes, navigation within the app
- **Implementation**: JSON serialization of role and permission data
- **Invalidation**: On logout, session expiration, or manual refresh

### 3. Persistent Cache

- **Storage**: Browser's localStorage
- **Lifetime**: Persistent across browser sessions
- **Use Cases**: Returning users, offline support
- **Implementation**: JSON serialization with timestamp
- **Invalidation**: On logout, TTL expiration, or version change

## Cache Structure

```typescript
interface RoleCache {
  roles: UserRole[];
  permissions: string[];
  timestamp: number; // Unix timestamp
  userId: string;
  version: string; // Cache version for schema changes
  ttl: number; // Time to live in seconds
}
```

## Caching Flow

1. **Cache Initialization**:
   - On auth state change to signed in
   - Check for existing valid cache
   - If no valid cache, fetch from database

2. **Cache Usage**:
   - First check in-memory cache
   - If not available, check session storage
   - If not available, check local storage
   - If not available, fetch from database

3. **Cache Updating**:
   - After successful role fetch
   - Update all cache levels
   - Set expiration based on TTL

4. **Cache Invalidation**:
   - On logout
   - On manual refresh
   - On TTL expiration
   - On version change
   - On detected role inconsistency

## TTL Strategy

- **Default TTL**: 15 minutes
- **Configurable**: Allow adjustment via provider props
- **Adaptive**: Shorter for admin users, longer for regular users
- **Override**: Allow force refresh for critical operations

## Cache Versioning

- **Version Format**: `YYYYMMDD-n` where n is an incremental number
- **Version Checking**: Compare cache version to current version
- **Version Updates**: When cache schema changes

## Monitoring and Metrics

- **Cache Hit Rate**: Track successful cache retrievals
- **Cache Misses**: Track failed cache retrievals
- **Fetch Latency**: Measure time for database fetches
- **Cache Size**: Monitor cache size for optimization

## Conflict Resolution

- **Last-Write-Wins**: For concurrent role updates
- **Force Refresh**: After critical role changes
- **Consistency Checking**: Periodic validation of cached vs. actual roles
