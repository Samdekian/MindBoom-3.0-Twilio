
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, RefreshCw, CalendarClock, AlertTriangle } from "lucide-react";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useGoogleCalendarCalendars } from "@/hooks/use-google-calendar-calendars";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const GoogleCalendarEvents = () => {
  const { 
    isConnected, 
    isLoading, 
    events, 
    refetchEvents, 
    calendarId, 
    calendarTitle 
  } = useGoogleCalendar();
  const { selectedCalendarId } = useGoogleCalendarCalendars();
  const [refreshing, setRefreshing] = React.useState(false);

  if (!isConnected) {
    return null;
  }
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchEvents();
    setRefreshing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events - {calendarTitle || "Google Calendar"}
          </CardTitle>
          <CardDescription>
            {selectedCalendarId 
              ? `Events from your selected Google Calendar`
              : "Select a calendar in settings to view and sync events"}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing || !selectedCalendarId}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="h-5 bg-muted rounded w-4/5"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : !selectedCalendarId ? (
          <div className="text-center py-6">
            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No calendar selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Go to Calendar Settings to select a Google Calendar
            </p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.summary}</h4>
                  <div className="flex items-center gap-2">
                    {event.hasConflicts && (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Conflict
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Scheduling Conflicts</h4>
                            <div className="text-sm text-muted-foreground">
                              {event.conflicts?.map((conflict: any, index: number) => (
                                <p key={index}>
                                  Conflicts with appointment on {format(parseISO(conflict.start_time), "MMM d, h:mm a")}
                                </p>
                              ))}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                    {event.isSynced && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Synced
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This event is synced with an appointment in MindBloom</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(parseISO(event.start.dateTime), "MMM d, h:mm a")} - 
                    {format(parseISO(event.end.dateTime), "h:mm a")}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming events in selected calendar</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarEvents;
