
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RBACStats } from "@/types/rbac-monitoring";

interface RoleConsistencySectionProps {
  stats: RBACStats;
}

const RoleConsistencySection: React.FC<RoleConsistencySectionProps> = ({ stats }) => {
  // Calculate consistency score between 0-100
  const consistencyScore = stats.healthScore || 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Role Consistency Check</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Overall System Health</span>
              <span className="text-sm font-medium">{consistencyScore}%</span>
            </div>
            <Progress 
              value={consistencyScore} 
              className={`h-2 ${
                consistencyScore > 80 ? 'bg-green-100' : 
                consistencyScore > 60 ? 'bg-yellow-100' : 
                'bg-red-100'
              }`}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Role Violations</div>
              <div className="mt-1 text-xl font-bold">{stats.recentViolations || 0}</div>
            </div>
            
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Active Users</div>
              <div className="mt-1 text-xl font-bold">{stats.uniqueUsers || 0}</div>
            </div>
            
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Pending Approvals</div>
              <div className="mt-1 text-xl font-bold">{stats.pendingApprovals || 0}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleConsistencySection;
