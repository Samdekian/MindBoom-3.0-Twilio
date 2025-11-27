
import React from "react";
import { RBACStats } from "@/types/rbac-monitoring";

interface RoleDistributionCardProps {
  stats: RBACStats;
}

const RoleDistributionCard: React.FC<RoleDistributionCardProps> = ({ stats }) => {
  const roleDistribution = stats.roleDistribution || {};
  
  // Get total sum of role counts - ensure it's a number
  const totalRoles = Object.values(roleDistribution).reduce((a, b) => Number(a) + Number(b), 0);
  
  return (
    <div className="rounded-lg border p-3">
      <div className="text-sm font-medium">Role Distribution</div>
      <div className="mt-2 space-y-2">
        {Object.entries(roleDistribution).length > 0 ? (
          Object.entries(roleDistribution).map(([role, count]) => (
            <div key={role} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{role}</span>
              <div className="flex items-center">
                <span className="text-xs font-medium">{String(count)}</span>
                <div className="ml-2 h-2 w-12 bg-secondary rounded-full">
                  <div 
                    className="h-2 rounded-full bg-primary" 
                    style={{ width: `${(Number(count) / totalRoles) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-muted-foreground">No role data available</div>
        )}
      </div>
    </div>
  );
};

export default RoleDistributionCard;
