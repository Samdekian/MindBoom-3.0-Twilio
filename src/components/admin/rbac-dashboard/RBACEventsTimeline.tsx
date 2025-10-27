
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RBACEvent } from '@/types/core/rbac';
import { RefreshCw, AlertCircle, Shield, Clock } from "lucide-react";
import { format } from 'date-fns';

interface RBACEventsTimelineProps {
  events: RBACEvent[];
  isLoading: boolean;
  error: Error | string | null;
  fetchEvents: () => Promise<void>;
}

const RBACEventsTimeline: React.FC<RBACEventsTimelineProps> = ({ events, isLoading, error, fetchEvents }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Recent Role and Permission Events</CardTitle>
        <Button 
          onClick={fetchEvents} 
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="flex items-center rounded-lg border border-red-200 bg-red-50 p-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-600">Error loading events: {typeof error === 'string' ? error : error.message}</span>
          </div>
        )}
        
        {isLoading && !events.length ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events recorded yet
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event) => (
              <div key={event.id} className="relative pl-6 pb-8 border-l-2 border-gray-100 last:border-0 last:pb-0">
                <div className="absolute left-[-8px] bg-white rounded-full border border-gray-200 p-1">
                  <Shield className="h-3 w-3 text-primary" />
                </div>
                
                <div className="flex items-center mb-1 text-sm">
                  <span className="font-medium mr-2">{event.actionType}</span>
                  <span className="text-muted-foreground flex items-center ml-auto">
                    <Clock className="h-3 w-3 mr-1 inline" />
                    {typeof event.timestamp === 'string' 
                      ? format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')
                      : format(event.timestamp, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">User:</span> {event.userName || event.userId}
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Resource:</span> {event.resourceType} - {event.resourceId}
                </div>
                
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 text-xs p-2 bg-gray-50 rounded">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RBACEventsTimeline;
