
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { RBACStats, RoleBreakdownItem } from "@/types/rbac-monitoring";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Users,
  Database,
  RefreshCcw,
  AlertCircle
} from "lucide-react";

const RBACMonitoringPanel: React.FC = () => {
  const [stats, setStats] = useState<RBACStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { performConsistencyCheck } = useAuthRBAC();

  // Fetch RBAC statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // This would typically be a real API call to get RBAC metrics
        // For demo purposes, we'll generate fake data
        
        // Get real user counts if possible
        const { data: userRolesData, error: userRolesError } = await supabase
          .from('user_roles')
          .select('user_id', { count: 'exact' });
        
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });
        
        // Get real role distribution
        const { data: roleCounts, error: roleCountsError } = await supabase
          .from('roles')
          .select(`
            name,
            user_roles!inner (
              user_id
            )
          `);
        
        // Generate statistics
        const roleDistribution: Record<string, number> = {};
        const roleBreakdown: RoleBreakdownItem[] = [];
        
        // Process real role data if available
        if (roleCounts && !roleCountsError) {
          roleCounts.forEach(role => {
            const count = role.user_roles?.length || 0;
            roleDistribution[role.name] = count;
            
            roleBreakdown.push({
              id: role.name,
              name: role.name,
              count,
              percentage: 0 // Will calculate below
            });
          });
        } else {
          // Fallback to sample data
          roleDistribution.admin = 3;
          roleDistribution.therapist = 24;
          roleDistribution.patient = 68;
          roleDistribution.support = 5;
          
          roleBreakdown.push(
            { id: 'admin', name: 'Admin', count: 3, percentage: 0 },
            { id: 'therapist', name: 'Therapist', count: 24, percentage: 0 },
            { id: 'patient', name: 'Patient', count: 68, percentage: 0 },
            { id: 'support', name: 'Support', count: 5, percentage: 0 }
          );
        }
        
        // Calculate percentages
        const totalRoles = Object.values(roleDistribution).reduce((sum, count) => sum + count, 0);
        roleBreakdown.forEach(item => {
          item.percentage = totalRoles > 0 ? Math.round((item.count / totalRoles) * 100) : 0;
        });
        
        // Create stats object
        const rbacStats: RBACStats = {
          totalUsers: (usersData?.length || 100),
          usersWithRoles: (userRolesData?.length || 100),
          roleDistribution,
          roleBreakdown,
          inconsistencies: Math.round(Math.random() * 10),
          errorRate: Math.random() * 0.05,
          healthScore: 85 + Math.round(Math.random() * 10),
          lastScanTime: new Date(Date.now() - Math.random() * 3600000),
          autoRepairCount: Math.round(Math.random() * 20),
          lastDayEvents: Math.round(Math.random() * 100),
          lastWeekEvents: Math.round(Math.random() * 500),
          activeRoles: Object.keys(roleDistribution).length,
          permissionChanges: Math.round(Math.random() * 50),
          roleChanges: Math.round(Math.random() * 30),
          totalEvents: Math.round(Math.random() * 1000),
          pendingApprovals: Math.round(Math.random() * 5),
          uniqueUsers: (usersData?.length || 100),
          recentViolations: Math.round(Math.random() * 10),
          recentErrors: [],
          mostActiveUsers: [
            { id: '1', name: 'admin@example.com', count: 28 },
            { id: '2', name: 'user1@example.com', count: 15 },
            { id: '3', name: 'user2@example.com', count: 8 }
          ],
          activityByType: {
            'login': 45,
            'role_change': 12,
            'permission_check': 78
          },
          lastActivity: new Date()
        };
        
        setStats(rbacStats);
      } catch (error) {
        console.error("Error fetching RBAC stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <p>RBAC Monitoring Panel</p>
    </div>
  );
};

export default RBACMonitoringPanel;
