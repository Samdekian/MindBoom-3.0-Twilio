
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryIcon } from "lucide-react";
import { useRoleHistory } from "@/hooks/use-role-history";
import { FilterControls } from "./role-history/FilterControls";
import { EventListItem } from "./role-history/EventListItem";
import { EmptyState } from "./role-history/EmptyState";
import { LoadingState } from "./role-history/LoadingState";

const RoleHistoryTimeline: React.FC = () => {
  const {
    events,
    isLoading,
    filter,
    setFilter,
    userFilter,
    setUserFilter,
    roleFilter,
    setRoleFilter,
    uniqueRoles,
  } = useRoleHistory();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <HistoryIcon className="h-5 w-5 mr-2" />
          Role History Timeline
        </CardTitle>
        <CardDescription>
          View all role changes and actions across the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FilterControls
            filter={filter}
            setFilter={(value) => setFilter(value as typeof filter)}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            roleFilter={roleFilter}
            setRoleFilter={(value) => setRoleFilter(value as typeof roleFilter)}
            uniqueRoles={uniqueRoles}
          />

          {isLoading ? (
            <LoadingState />
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleHistoryTimeline;
