
import React from 'react';
import { Shield, Users, FileText, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RBACStats } from '@/types/core/rbac';
import { formatRelativeTime } from '@/utils/date/format';

interface StatsOverviewProps {
  stats: RBACStats;
  isLoading: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-3/4 bg-gray-300 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold">{stats.totalUsers}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {stats.usersWithRoles} with roles
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold">{stats.lastDayEvents}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              events in the last 24h
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Inconsistencies</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold">{stats.inconsistencies}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {stats.autoRepairCount} auto-repaired
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Last Scan</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold">
              {stats.lastScanTime ? formatRelativeTime(new Date(stats.lastScanTime)) : 'Never'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
