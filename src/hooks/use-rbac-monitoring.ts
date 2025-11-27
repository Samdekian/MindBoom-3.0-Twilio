import { useState, useEffect, useCallback } from "react";
import { fetchRBACStats } from "@/utils/rbac/fetchRBACStats";
import { fetchRBACEvents } from "@/utils/rbac/fetchRBACEvents";
import { RBACEvent, RBACStats, RoleBreakdownItem } from "@/types/core/rbac";

interface RBACMonitoringResult {
  stats: RBACStats | null;
  events: RBACEvent[];
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshEvents: () => Promise<void>;
}

// Helper function to map action strings to valid RBACEvent actions
const mapToValidAction = (actionType: string): RBACEvent['action'] => {
  const lowerAction = actionType.toLowerCase();
  if (lowerAction.includes('role') && lowerAction.includes('assign')) return 'role_assigned';
  if (lowerAction.includes('role') && lowerAction.includes('remove')) return 'role_removed';
  if (lowerAction.includes('permission') && lowerAction.includes('grant')) return 'permission_granted';
  if (lowerAction.includes('permission') && lowerAction.includes('revoke')) return 'permission_revoked';
  if (lowerAction.includes('logout')) return 'logout';
  return 'login'; // default fallback
};

export function useRBACMonitoring(): RBACMonitoringResult {
  const [stats, setStats] = useState<RBACStats | null>(null);
  const [events, setEvents] = useState<RBACEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rbacStats = await fetchRBACStats();

      // Process roleBreakdown to ensure it has the correct format
      const roleBreakdownItems = Array.isArray(rbacStats.roleBreakdown)
        ? rbacStats.roleBreakdown.map(item => ({
            id: item.id || item.name || '',
            name: item.name || '',
            role: item.role || item.name || '',
            count: Number(item.count) || 0,
            percentage: item.percentage || 0
          }))
        : Object.entries(rbacStats.roleDistribution || {}).map(([name, count]) => ({
            id: name,
            name,
            role: name,
            count: Number(count) || 0,
            percentage: (rbacStats.totalUsers ? (Number(count) / rbacStats.totalUsers) * 100 : 0)
          }));

      // Compose all camelCase RBACStats properties only
      const extendedStats: RBACStats = {
        ...rbacStats,
        roleBreakdown: roleBreakdownItems,
        totalUsers: rbacStats.totalUsers ?? 0,
        roleDistribution: rbacStats.roleDistribution ?? {},
      };

      setStats(extendedStats);
    } catch (err: any) {
      console.error("Error fetching RBAC stats:", err);
      setError(err.message || "Failed to fetch RBAC statistics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rbacEvents = await fetchRBACEvents(50);
      const normalizedEvents: RBACEvent[] = rbacEvents.map(event => ({
        id: event.id,
        userId: event.userId || '',
        userName: event.userName || '',
        action: event.actionType || 'login',
        actionType: event.actionType || 'login',
        details: event.details || {},
        timestamp: typeof event.timestamp === 'string'
          ? event.timestamp
          : (event.timestamp instanceof Date
              ? event.timestamp.toISOString()
              : new Date().toISOString()),
        resourceType: event.resourceType || 'user',
        resourceId: event.resourceId || '',
        metadata: event.metadata || {},
        role: event.metadata?.role,
        performedBy: event.metadata?.performedBy,
        performedByName: event.metadata?.performedByName,
        targetUserName: event.metadata?.targetUserName
      }));

      setEvents(normalizedEvents);
    } catch (err: any) {
      console.error("Error fetching RBAC events:", err);
      setError(err.message || "Failed to fetch RBAC events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([refreshStats(), refreshEvents()]);
    };

    loadData();
  }, [refreshStats, refreshEvents]);

  return {
    stats,
    events,
    isLoading,
    error,
    refreshStats,
    refreshEvents
  };
}

export default useRBACMonitoring;
