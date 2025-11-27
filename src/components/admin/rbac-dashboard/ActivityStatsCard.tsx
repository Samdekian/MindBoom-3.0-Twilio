
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RBACStats } from "@/types/rbac-monitoring";

interface ActivityStatsCardProps {
  stats: RBACStats;
}

const ActivityStatsCard: React.FC<ActivityStatsCardProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>RBAC Activity</CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.lastDayEvents}</div>
        <p className="text-sm text-muted-foreground mt-2">
          Role-related events in the past day
        </p>
      </CardContent>
    </Card>
  );
};

export default ActivityStatsCard;
