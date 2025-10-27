
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RBACEvent } from "@/types/rbac-monitoring";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsTabContentProps {
  events: RBACEvent[];
  loading: boolean;
  refreshEvents: (limit?: number) => Promise<void>;
}

export const EventsTabContent: React.FC<EventsTabContentProps> = ({
  events,
  loading,
  refreshEvents
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => {
                const formattedDate = new Date(event.timestamp).toLocaleString();
                
                return (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                    <TableCell>{event.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {event.actionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event.resourceType}/{event.resourceId.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {event.role && <span className="text-muted-foreground">Role: {event.role}</span>}
                      {event.targetUserName && (
                        <span className="text-muted-foreground block">Target: {event.targetUserName}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No events found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventsTabContent;
