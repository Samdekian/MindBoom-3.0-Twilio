import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CircleDollarSign, Users, ShieldCheck, AlertTriangle, UserPlus, UserMinus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RBACStats } from "@/types/core/rbac";

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);

const RBACStatsOverview = ({ stats }: { stats: RBACStats | null }) => {
  if (!stats) {
    return <LoadingSkeleton />;
  }

  // Helper to safely render dynamic content
  const safeRender = (content: any): React.ReactNode => {
    if (content === null || content === undefined) {
      return "N/A";
    }
    
    if (typeof content === 'number' || typeof content === 'string' || typeof content === 'boolean') {
      return content;
    }
    
    if (content instanceof Date) {
      return content.toLocaleString();
    }
    
    // For arrays, objects, etc. - convert to string representation
    return JSON.stringify(content);
  };

  // Helper to process roleBreakdown which can be a record or array
  const processRoleBreakdown = () => {
    if (!stats.roleBreakdown) {
      return [];
    }
    
    if (Array.isArray(stats.roleBreakdown)) {
      return stats.roleBreakdown;
    }
    
    if (typeof stats.roleBreakdown === 'object') {
      return Object.entries(stats.roleBreakdown).map(([role, count]) => ({
        id: role,
        name: role,
        role: role,
        count: count as number,
        percentage: ((count as number) / stats.totalUsers) * 100
      }));
    }
    
    return [];
  };
  
  const roleBreakdownData = processRoleBreakdown();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>RBAC Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeRender(stats.totalUsers)}</div>
                <p className="text-sm text-muted-foreground">
                  {safeRender(stats.usersWithRoles)} with assigned roles
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events (Last 24h)</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeRender(stats.lastDayEvents)}</div>
                <p className="text-sm text-muted-foreground">
                  {safeRender(stats.roleChanges)} role changes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inconsistencies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeRender(stats.inconsistencies)}</div>
                <p className="text-sm text-muted-foreground">
                  Last scan: {stats.lastScanTime ? safeRender(stats.lastScanTime) : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Repairs</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeRender(stats.autoRepairCount)}</div>
                <p className="text-sm text-muted-foreground">
                  {safeRender(stats.errorRate)}% error rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeRender(stats.uniqueUsers)}</div>
                <p className="text-sm text-muted-foreground">
                  {safeRender(stats.permissionChanges)} permission changes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Violations</CardTitle>
                <UserMinus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeRender(stats.recentViolations)}</div>
                <p className="text-sm text-muted-foreground">
                  Health Score: {safeRender(stats.healthScore)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-none space-y-2">
                  {stats.mostActiveUsers && stats.mostActiveUsers.length > 0 ? (
                    stats.mostActiveUsers.map(user => (
                      <li key={user.id} className="flex items-center justify-between">
                        <span>{safeRender(user.name)}</span>
                        <Badge variant="secondary">{safeRender(user.count)}</Badge>
                      </li>
                    ))
                  ) : (
                    <li>No active users</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-none space-y-2">
                  {stats.recentErrors && stats.recentErrors.length > 0 ? (
                    stats.recentErrors.map(error => (
                      <li key={error.id} className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{safeRender(error.message)}</div>
                          <div className="text-sm text-muted-foreground">
                            {error.timestamp ? safeRender(error.timestamp) : 'N/A'}
                          </div>
                        </div>
                        <Badge variant="destructive">Error</Badge>
                      </li>
                    ))
                  ) : (
                    <li>No recent errors</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            {roleBreakdownData.map(role => (
              <div key={role.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div>
                  <div className="font-medium">{safeRender(role.name)}</div>
                  <div className="text-sm text-muted-foreground">
                    {safeRender(role.count)} users ({safeRender(role.percentage.toFixed(1))}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RBACStatsOverview;
