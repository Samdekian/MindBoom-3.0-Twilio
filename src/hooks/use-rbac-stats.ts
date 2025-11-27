import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RBACStats {
  totalUsers: number;
  usersWithRoles: number;
  roleDistribution: Record<string, number>;
  roleBreakdown: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  inconsistencies: number;
  lastScanTime: Date;
  errorRate: number;
  autoRepairCount: number;
  lastDayEvents: number;
  lastWeekEvents: number;
  totalEvents: number;
  activeRoles: number;
  pendingApprovals: number;
  roleChanges: number;
  permissionChanges: number;
  healthScore: number;
  recentViolations: number;
  recentErrors: any[];
  uniqueUsers: number;
  activityByType: Record<string, number>;
  lastActivity: Date;
  mostActiveUsers: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface RBACEvent {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  actionType: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, any>;
}

export function useRBACStats() {
  const [stats, setStats] = useState<RBACStats | null>(null);
  const [events, setEvents] = useState<RBACEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get users with roles count
      const { data: usersWithRoles } = await supabase
        .from('user_roles')
        .select('user_id', { count: 'exact' });

      const uniqueUsersWithRoles = new Set(usersWithRoles?.map(ur => ur.user_id)).size;

      // Get role distribution
      const { data: roleDistributionData } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles!inner(name)
        `);

      const roleDistribution: Record<string, number> = {};
      const roleBreakdown: Array<{ id: string; name: string; count: number; percentage: number }> = [];

      if (roleDistributionData) {
        const roleCounts: Record<string, number> = {};
        roleDistributionData.forEach(ur => {
          const roleName = (ur.roles as any)?.name;
          if (roleName) {
            roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
          }
        });

        Object.entries(roleCounts).forEach(([name, count]) => {
          roleDistribution[name] = count;
          roleBreakdown.push({
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
            percentage: totalUsers ? Math.round((count / totalUsers) * 100) : 0
          });
        });
      }

      // Get recent audit events
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { count: lastDayEvents } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('activity_timestamp', oneDayAgo);

      const { count: lastWeekEvents } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('activity_timestamp', oneWeekAgo);

      const { count: totalEvents } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      // Get activity by type
      const { data: activityData } = await supabase
        .from('audit_logs')
        .select('activity_type')
        .gte('activity_timestamp', oneWeekAgo);

      const activityByType: Record<string, number> = {};
      activityData?.forEach(log => {
        activityByType[log.activity_type] = (activityByType[log.activity_type] || 0) + 1;
      });

      // Get most active users
      const { data: userActivityData } = await supabase
        .from('audit_logs')
        .select('user_id')
        .gte('activity_timestamp', oneWeekAgo);

      const userActivityCounts: Record<string, number> = {};
      userActivityData?.forEach(log => {
        userActivityCounts[log.user_id] = (userActivityCounts[log.user_id] || 0) + 1;
      });

      const mostActiveUsers = Object.entries(userActivityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([userId, count]) => ({
          id: userId,
          name: userId, // Could fetch profile name here
          count
        }));

      // Get role changes and permission changes
      const { count: roleChanges } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .in('activity_type', ['role_assigned', 'role_removed'])
        .gte('activity_timestamp', oneWeekAgo);

      const { count: permissionChanges } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('activity_type', 'permission_change')
        .gte('activity_timestamp', oneWeekAgo);

      // Calculate health score based on various factors
      const healthScore = Math.max(0, Math.min(100, 
        100 - (roleChanges || 0) * 2 - (permissionChanges || 0) * 5
      ));

      const calculatedStats: RBACStats = {
        totalUsers: totalUsers || 0,
        usersWithRoles: uniqueUsersWithRoles,
        roleDistribution,
        roleBreakdown,
        inconsistencies: 0, // Will be updated by consistency check
        lastScanTime: new Date(),
        errorRate: 0, // Could calculate from error logs
        autoRepairCount: 0, // Could track from repair operations
        lastDayEvents: lastDayEvents || 0,
        lastWeekEvents: lastWeekEvents || 0,
        totalEvents: totalEvents || 0,
        activeRoles: Object.keys(roleDistribution).length,
        pendingApprovals: 0, // Could get from profiles with pending approval
        roleChanges: roleChanges || 0,
        permissionChanges: permissionChanges || 0,
        healthScore,
        recentViolations: 0,
        recentErrors: [],
        uniqueUsers: uniqueUsersWithRoles,
        activityByType,
        lastActivity: new Date(),
        mostActiveUsers
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching RBAC stats:', error);
      setError('Failed to load RBAC statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('activity_timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedEvents: RBACEvent[] = data?.map(log => ({
        id: log.id,
        userId: log.user_id,
        userName: log.user_id, // Could fetch profile name
        timestamp: new Date(log.activity_timestamp),
        actionType: log.activity_type,
        resourceType: log.resource_type || '',
        resourceId: log.resource_id || '',
        metadata: log.metadata as Record<string, any> || {}
      })) || [];

      setEvents(formattedEvents);
      return formattedEvents;
    } catch (error) {
      console.error('Error fetching RBAC events:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  return {
    stats,
    events,
    isLoading,
    error,
    refreshStats: fetchStats,
    refreshEvents: fetchEvents
  };
}