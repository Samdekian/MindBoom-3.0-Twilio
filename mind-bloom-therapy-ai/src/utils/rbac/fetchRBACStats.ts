import { RBACStats } from '@/types/core/rbac';

// Mock function to simulate fetching RBAC statistics from an API
// In a real application, you would replace this with an actual API call
async function simulateApiCall<T>(data: T, delay: number = 500): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
}

export async function fetchRBACStats(): Promise<RBACStats> {
  // Simulate fetching data from an API
  const data = await simulateApiCall({
    totalUsers: 150,
    roleDistribution: {
      admin: 5,
      therapist: 30,
      patient: 100,
      support: 15
    },
    lastUpdated: new Date(),
    avgResolutionTime: 24,
    successRate: 0.95,
    roleBreakdown: [
      { id: 'admin', name: 'Admin', count: 5, percentage: 3.33 },
      { id: 'therapist', name: 'Therapist', count: 30, percentage: 20 },
      { id: 'patient', name: 'Patient', count: 100, percentage: 66.67 },
      { id: 'support', name: 'Support', count: 15, percentage: 10 }
    ],
    usersWithRoles: 150,
    lastDayEvents: 30,
    lastWeekEvents: 200,
    totalEvents: 500,
    activeRoles: 4,
    pendingApprovals: 2,
    inconsistencies: 5,
    lastScanTime: new Date(Date.now() - 86400000),
    errorRate: 0.02,
    autoRepairCount: 3,
    mostActiveUsers: [
      { id: 'user1', name: 'John Doe', count: 50 },
      { id: 'user2', name: 'Jane Smith', count: 45 },
      { id: 'user3', name: 'Jim Brown', count: 40 }
    ],
    recentErrors: [
      { id: 'error1', message: 'Failed to assign role', timestamp: new Date() },
      { id: 'error2', message: 'Permission check failed', timestamp: new Date(Date.now() - 3600000) }
    ],
    uniqueUsers: 120,
    roleChanges: 10,
    permissionChanges: 5,
    healthScore: 98,
    recentViolations: 2,
    activityByType: {
      login: 50,
      role_change: 10,
      permission_check: 20
    },
    lastActivity: new Date()
  });
  // When building the output, always use camelCase section names:
  return {
    totalUsers: data.totalUsers,
    roleDistribution: data.roleDistribution,
    // ... assign other properties in camelCase, not snake_case
    lastUpdated: data.lastUpdated,
    avgResolutionTime: data.avgResolutionTime,
    successRate: data.successRate,
    roleBreakdown: data.roleBreakdown,
    usersWithRoles: data.usersWithRoles,
    lastDayEvents: data.lastDayEvents,
    lastWeekEvents: data.lastWeekEvents,
    totalEvents: data.totalEvents,
    activeRoles: data.activeRoles,
    pendingApprovals: data.pendingApprovals,
    inconsistencies: data.inconsistencies,
    lastScanTime: data.lastScanTime,
    errorRate: data.errorRate,
    autoRepairCount: data.autoRepairCount,
    mostActiveUsers: data.mostActiveUsers,
    recentErrors: data.recentErrors,
    uniqueUsers: data.uniqueUsers,
    roleChanges: data.roleChanges,
    permissionChanges: data.permissionChanges,
    healthScore: data.healthScore,
    recentViolations: data.recentViolations,
    activityByType: data.activityByType,
    lastActivity: data.lastActivity,
  };
}
