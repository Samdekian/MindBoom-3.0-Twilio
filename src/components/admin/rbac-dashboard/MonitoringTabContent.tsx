
import React from "react";
import { AlertCircle } from "lucide-react";
import RoleDistributionCard from "./RoleDistributionCard";
import TotalUsersCard from "./TotalUsersCard";
import RoleConsistencySection from "./RoleConsistencySection";
import RoleHealthDashboard from "./RoleHealthDashboard";
import { RBACStats } from "@/types/rbac-monitoring";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface MonitoringTabContentProps {
  stats: RBACStats | null;
  isLoading: boolean;
  refreshStats: () => Promise<void>;
  error: Error | null;
}

export const MonitoringTabContent: React.FC<MonitoringTabContentProps> = ({
  stats,
  isLoading,
  refreshStats,
  error
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading RBAC monitoring data</AlertTitle>
        <AlertDescription>
          {error.message || "An unknown error occurred"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          No RBAC monitoring data is currently available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalUsersCard count={stats.uniqueUsers || 0} />
        <RoleDistributionCard stats={stats} />
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Role Changes</div>
            <div className="text-2xl font-bold">{stats.roleChanges}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Permission Changes</div>
            <div className="text-2xl font-bold">{stats.permissionChanges}</div>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium">System Health</div>
          <div className="text-2xl font-bold">{stats.healthScore}%</div>
          <div className="mt-1 h-2 w-full rounded-full bg-secondary">
            <div 
              className={`h-2 rounded-full ${stats.healthScore > 80 ? 'bg-green-500' : stats.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${stats.healthScore}%` }}
            />
          </div>
        </div>
      </div>

      <RoleConsistencySection stats={stats} />
      <RoleHealthDashboard stats={stats} />
    </div>
  );
};

export default MonitoringTabContent;
