
import React from "react";
import { CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useGoogleCalendarCalendars } from "@/hooks/use-google-calendar-calendars";
import { useSetGoogleCalendar } from "@/hooks/use-set-google-calendar";
import { GoogleCalendarSyncStatus } from "./google-calendar/GoogleCalendarSyncStatus";

const GoogleCalendarSelector = () => {
  const { calendarList, isLoading, error, selectedCalendarId } = useGoogleCalendarCalendars();
  const { setGoogleCalendar, isSettingCalendar } = useSetGoogleCalendar();

  const handleSelectCalendar = (calendarId: string) => {
    setGoogleCalendar.mutate(calendarId);
  };

  return (
    <CardContent className="space-y-4 pt-2">
      <div>
        <div className="mb-2">
          <label htmlFor="calendar-select" className="text-sm font-medium mb-1 block">
            Select Calendar for Appointment Sync
          </label>
          <Select
            disabled={isLoading || isSettingCalendar}
            value={selectedCalendarId || ""}
            onValueChange={handleSelectCalendar}
          >
            <SelectTrigger id="calendar-select">
              <SelectValue placeholder={
                isLoading ? "Loading calendars..." : 
                error ? "Error loading calendars" : 
                "Select a calendar"
              } />
            </SelectTrigger>
            <SelectContent>
              {calendarList?.map((calendar) => (
                <SelectItem key={calendar.id} value={calendar.id}>
                  {calendar.summary} {calendar.primary && "(Primary)"}
                </SelectItem>
              ))}
              {calendarList && calendarList.length === 0 && (
                <SelectItem value="none" disabled>
                  No calendars found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {isSettingCalendar && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating calendar selection...</span>
          </div>
        )}
        
        <GoogleCalendarSyncStatus calendarId={selectedCalendarId} />
      </div>
    </CardContent>
  );
};

export default GoogleCalendarSelector;
