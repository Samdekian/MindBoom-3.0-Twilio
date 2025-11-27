
import { useState, useEffect, useCallback } from "react";
import { fetchRBACStats } from "@/utils/rbac/fetchRBACStats";
import { fetchRBACEvents } from "@/utils/rbac/fetchRBACEvents";
import { RBACEvent } from "@/utils/rbac/types";

interface RBACMonitoringResult {
  stats: any | null;
  events: RBACEvent[];
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export function useRBACMonitoring(): RBACMonitoringResult {
  const [stats, setStats] = useState<any | null>(null);
  const [events, setEvents] = useState<RBACEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const rbacStats = await fetchRBACStats();
      setStats(rbacStats);
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
      setEvents(rbacEvents);
    } catch (err: any) {
      console.error("Error fetching RBAC events:", err);
      setError(err.message || "Failed to fetch RBAC events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on initial mount
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
