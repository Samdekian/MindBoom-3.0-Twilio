
import React from "react";
import { Users } from "lucide-react";

interface TotalUsersCardProps {
  count: number;
}

const TotalUsersCard: React.FC<TotalUsersCardProps> = ({ count }) => {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Total Users</div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold mt-1">{count}</div>
    </div>
  );
};

export default TotalUsersCard;
