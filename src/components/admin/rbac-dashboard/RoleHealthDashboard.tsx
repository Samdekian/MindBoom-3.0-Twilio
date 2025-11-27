
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RBACStats } from "@/types/rbac-monitoring";

interface RoleHealthDashboardProps {
  stats: RBACStats;
}

const RoleHealthDashboard: React.FC<RoleHealthDashboardProps> = ({ stats }) => {
  // Show top active users if available
  const mostActiveUsers = stats.mostActiveUsers || [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">System Activity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Activity by type */}
          <div>
            <h4 className="text-sm font-medium mb-2">Activity by Type</h4>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
              {Object.entries(stats.activityByType || {}).map(([type, count]) => (
                <div key={type} className="rounded-lg border p-2">
                  <div className="text-xs text-muted-foreground">{type}</div>
                  <div className="text-sm font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Most active users */}
          {mostActiveUsers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Most Active Users</h4>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 gap-2 p-2 font-medium text-xs border-b">
                  <div>User</div>
                  <div>Email</div>
                  <div>Actions</div>
                </div>
                {mostActiveUsers.map((user, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-2 text-sm items-center">
                    <div className="truncate">{user.name}</div>
                    <div className="truncate text-muted-foreground">{user.email || "N/A"}</div>
                    <div>{user.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Last activity */}
          <div className="flex justify-end">
            <div className="text-xs text-muted-foreground">
              Last activity: {stats.lastActivity ? new Date(stats.lastActivity).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleHealthDashboard;
