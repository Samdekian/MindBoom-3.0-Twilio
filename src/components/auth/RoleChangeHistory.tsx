
import React, { useState, useEffect } from "react";
import { formatDateTime, getTimeAgo } from "@/utils/date/format";
import { RoleEvent, RoleActionType } from "@/types/core/rbac";
import { Loader2 } from "lucide-react";

// Mock data for this component since we don't have a real implementation yet
const mockEvents: RoleEvent[] = [
  {
    id: "event-1",
    user_id: "user-1",
    userId: "user-1",
    userName: "John Doe",
    timestamp: new Date().toISOString(),
    actionType: "assigned",
    role: "admin",
    action: "assigned",
    performedBy: "admin-1",
    performedByName: "Admin User"
  },
  {
    id: "event-2",
    user_id: "user-2",
    userId: "user-2", 
    userName: "Jane Smith",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionType: "removed",
    role: "therapist",
    action: "removed",
    performedBy: "admin-1",
    performedByName: "Admin User"
  },
  {
    id: "event-3",
    user_id: "user-3",
    userId: "user-3",
    userName: "Bob Johnson", 
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionType: "assigned",
    role: "patient",
    action: "assigned",
    performedBy: "admin-2",
    performedByName: "Super Admin"
  }
];

// Mock hook to use in the component
const useRoleNotification = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    events: mockEvents,
    loading,
    refresh: () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  };
};

const RoleChangeHistory: React.FC = () => {
  const { events, loading, refresh } = useRoleNotification();

  const getActionText = (actionType: RoleActionType | undefined) => {
    switch (actionType) {
      case "assigned":
        return "Added";
      case "removed":
        return "Removed";
      case "edited":
        return "Modified";
      default:
        return "Updated";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No role changes recorded
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Showing {events.length} recent role changes
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-md p-4 bg-background">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{event.userName}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="text-primary">{getActionText(event.actionType as RoleActionType)}</span>{" "}
                  <span className="font-medium">{event.role}</span> role
                </div>
              </div>
              <div>
                <div className="text-xs text-right text-muted-foreground">
                  {getTimeAgo(event.timestamp)}
                </div>
                <div className="text-xs text-right text-muted-foreground mt-1">
                  by {event.performedByName || "System"}
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {formatDateTime(event.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleChangeHistory;
