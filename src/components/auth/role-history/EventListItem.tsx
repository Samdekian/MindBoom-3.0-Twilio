
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { EventIcon } from "./EventIcon";
import { RoleEvent, RoleActionType } from "@/types/core/rbac";

export const EventListItem: React.FC<{ event: RoleEvent }> = ({ event }) => {
  const formattedTime = formatDistanceToNow(
    new Date(event.timestamp),
    { addSuffix: true }
  );

  const getBadgeVariant = (actionType: RoleActionType) => {
    switch (actionType) {
      case "assigned":
        return "default";
      case "removed":
        return "destructive";
      case "edited":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getActionText = (actionType: RoleActionType) => {
    switch (actionType) {
      case "assigned":
        return "assigned";
      case "removed":
        return "removed";
      case "edited":
        return "updated";
      default:
        return "changed";
    }
  };

  // Ensure we're using the correct action type from the event
  const actionType = (event.actionType || event.action) as RoleActionType;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-muted rounded-full p-2 mt-0.5">
            <EventIcon 
              actionType={actionType} 
              className="h-4 w-4 text-primary" 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {event.userName || event.user_id}
                </p>
                <Badge variant={getBadgeVariant(actionType)}>
                  {getActionText(actionType)}
                </Badge>
              </div>
              <time className="text-muted-foreground text-xs">
                {formattedTime}
              </time>
            </div>
            
            <p className="text-sm mt-1">
              Role <span className="font-mono">{event.role}</span> was {getActionText(actionType)} 
              {event.performedBy !== event.user_id && ` by ${event.performedByName || 'System'}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
