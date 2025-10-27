import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface AdminStats {
  totalUsers: number;
  activeTherapists: number;
  pendingApprovals: number;
  systemHealth: number;
  recentActivity: ActivityItem[];
  systemAlerts: AlertItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  description: string;
  actionRequired: boolean;
  actionPath?: string;
}

export const useAdminStats = () => {
  const { user } = useAuthRBAC();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setError('Access denied');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active therapists
      const { count: activeTherapists } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_type', 'therapist')
        .eq('approval_status', 'approved');

      // Fetch pending therapist approvals
      const { count: pendingApprovals } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_type', 'therapist')
        .eq('approval_status', 'pending');

      // Fetch recent activity from audit logs
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select(`
          id,
          activity_type,
          metadata,
          activity_timestamp,
          user_id
        `)
        .order('activity_timestamp', { ascending: false })
        .limit(10);

      // Process recent activity
      const recentActivity: ActivityItem[] = (auditLogs || []).map(log => ({
        id: log.id,
        type: log.activity_type,
        message: formatActivityMessage(log.activity_type, log.metadata),
        timestamp: new Date(log.activity_timestamp),
        userId: log.user_id
      }));

      // Generate system alerts based on actual data
      const systemAlerts: AlertItem[] = [];
      
      if ((pendingApprovals || 0) > 0) {
        systemAlerts.push({
          id: 'pending-approvals',
          type: 'warning',
          title: `${pendingApprovals} Therapist Applications Pending`,
          description: 'Require approval for access',
          actionRequired: true,
          actionPath: '/admin/therapist-approval'
        });
      }

      // Check for recent system errors
      const { count: recentErrors } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .like('activity_type', '%error%')
        .gte('activity_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if ((recentErrors || 0) > 0) {
        systemAlerts.push({
          id: 'recent-errors',
          type: 'error',
          title: `${recentErrors} System Errors in Last 24 Hours`,
          description: 'Review error logs for issues',
          actionRequired: true,
          actionPath: '/admin/system-logs'
        });
      }

      // Add success alert if no issues
      if (systemAlerts.length === 0) {
        systemAlerts.push({
          id: 'system-healthy',
          type: 'info',
          title: 'System Running Smoothly',
          description: 'All systems operational',
          actionRequired: false
        });
      }

      // Calculate system health (simplified)
      const systemHealth = Math.max(95 - (recentErrors || 0) * 2, 85);

      setStats({
        totalUsers: totalUsers || 0,
        activeTherapists: activeTherapists || 0,
        pendingApprovals: pendingApprovals || 0,
        systemHealth,
        recentActivity,
        systemAlerts
      });

    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin-stats-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs'
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { stats, loading, error, refreshStats: fetchStats };
};

const formatActivityMessage = (activityType: string, metadata: any): string => {
  switch (activityType) {
    case 'user_created_with_role':
      return `New user registered: ${metadata?.full_name || 'Unknown user'}`;
    case 'role_assigned':
      return `Role assigned: ${metadata?.role || 'Unknown role'}`;
    case 'approval_status_change':
      return `Therapist ${metadata?.new_status || 'status changed'}: ${metadata?.therapist_name || 'Unknown'}`;
    case 'therapist_application_approve':
      return `Therapist application approved: ${metadata?.applicant_name || 'Unknown'}`;
    case 'therapist_application_reject':
      return `Therapist application rejected: ${metadata?.applicant_name || 'Unknown'}`;
    default:
      return `${activityType.replace(/_/g, ' ')}`;
  }
};
