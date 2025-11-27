
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Settings, AlertTriangle } from 'lucide-react';
import { useAdminStats, ActivityItem } from '@/hooks/useAdminStats';
import { formatDistanceToNow } from 'date-fns';

const RecentActivityFeed: React.FC = () => {
  const { stats, loading } = useAdminStats();

  const getActivityIcon = (type: string) => {
    if (type.includes('user')) return User;
    if (type.includes('role') || type.includes('approval')) return Settings;
    if (type.includes('error')) return AlertTriangle;
    return Clock;
  };

  const getActivityColor = (type: string) => {
    if (type.includes('error')) return 'text-red-600';
    if (type.includes('approval')) return 'text-green-600';
    if (type.includes('user')) return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest administrative actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats?.recentActivity.length ? (
            stats.recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 ${color.replace('text-', 'bg-')} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
