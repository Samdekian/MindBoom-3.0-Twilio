
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleEvent, UserRole } from "@/types/core/rbac";

// Function to normalize audit log to role event
function normalizeRoleChangeEvent(log: any): RoleEvent {
  const metadata = typeof log.metadata === 'object' ? log.metadata : {};
  
  const actionType = getActionTypeFromActivityType(log.activity_type);
  
  return {
    id: log.id || `event-${Date.now()}`,
    user_id: log.user_id || '',
    userId: log.user_id || '',
    userName: log.user_name || '',
    timestamp: log.activity_timestamp || new Date().toISOString(),
    actionType,
    action: actionType,
    role: metadata.role || '',
    performedBy: metadata.performed_by || log.user_id || '',
    performedByName: metadata.performer_name || metadata.performed_by_name || '',
    actor_id: metadata.performed_by || log.user_id || '',
    reason: metadata.reason || ''
  };
}

// Convert activity type to action type
function getActionTypeFromActivityType(activityType: string): 'assigned' | 'removed' | 'edited' {
  if (activityType && typeof activityType === 'string') {
    if (activityType.includes('assign')) return 'assigned';
    if (activityType.includes('remove')) return 'removed';
  }
  return 'edited';
}

export const useRoleHistory = (userId?: string) => {
  const [roleHistory, setRoleHistory] = useState<RoleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'removed' | 'edited'>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const { toast } = useToast();

  const fetchRoleHistory = async (targetUserId?: string) => {
    const queryUserId = targetUserId || userId;
    
    if (!queryUserId) {
      setError("No user ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query audit logs for role changes
      let query = supabase
        .from('audit_logs')
        .select('*')
        .or('activity_type.ilike.%role%,activity_type.ilike.%assign%,activity_type.ilike.%remove%')
        .order('activity_timestamp', { ascending: false })
        .limit(50);

      if (queryUserId) {
        query = query.eq('user_id', queryUserId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform audit logs to role events
      const events = (data || []).map(normalizeRoleChangeEvent);
      setRoleHistory(events);

    } catch (err: any) {
      console.error('Error fetching role history:', err);
      setError(err.message || 'Failed to fetch role history');
      
      toast({
        title: "Error fetching role history",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRoleHistory(userId);
    }
  }, [userId]);

  // Filter events based on current filters
  const filteredEvents = roleHistory.filter(event => {
    if (filter !== 'all' && event.actionType !== filter) return false;
    if (userFilter && !event.userName.toLowerCase().includes(userFilter.toLowerCase())) return false;
    if (roleFilter !== 'all' && event.role !== roleFilter) return false;
    return true;
  });

  // Get unique roles from history
  const uniqueRoles = Array.from(new Set(roleHistory.map(event => event.role).filter(Boolean))) as UserRole[];

  return {
    roleHistory,
    loading,
    isLoading: loading, // Add alias
    error,
    events: filteredEvents, // Add filtered events
    filter,
    setFilter,
    userFilter,
    setUserFilter,
    roleFilter,
    setRoleFilter,
    uniqueRoles,
    fetchRoleHistory,
    refetch: () => fetchRoleHistory(userId)
  };
};

export default useRoleHistory;
