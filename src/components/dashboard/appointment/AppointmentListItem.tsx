import React from "react";
import { Video, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import AppointmentSyncStatus from "../AppointmentSyncStatus";
import { Appointment } from "@/types/appointments";
import AppointmentConflicts from "./AppointmentConflicts";
import { format } from "date-fns";

interface AppointmentListItemProps {
  appointment: Appointment;
  isTherapist: boolean;
  onConfirm: (id: string) => void;
  onSync: (id: string) => void;
  onJoinVideo: (id: string) => void;
  isGoogleCalendarConnected: boolean;
}

const AppointmentListItem = ({ 
  appointment,
  isTherapist,
  onConfirm,
  onSync,
  onJoinVideo,
  isGoogleCalendarConnected 
}: AppointmentListItemProps) => {
  const needsSync = !appointment.google_calendar_event_id || 
                   appointment.sync_status === 'failed' || 
                   appointment.sync_status === 'pending';

  const hasConflicts = Array.isArray(appointment.conflicts) && appointment.conflicts.length > 0;

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-medium">{appointment.title}</h4>
        {appointment.google_calendar_event_id && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Calendar className="h-3 w-3 mr-1" />
                  Synced
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This appointment is synced with Google Calendar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {appointment.recurrence_rule && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            Recurring
          </Badge>
        )}
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 mr-1" />
        <span>
          {new Date(appointment.start_time).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })} at{" "}
          {new Date(appointment.start_time).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
      {appointment.video_meeting_id && (
        <div className="mt-1 text-xs text-blue-700">
          Video Meeting ID:&nbsp;
          <span className="font-mono">{appointment.video_meeting_id}</span>
        </div>
      )}
      {typeof appointment.recording_consent === "boolean" && (
        <div className="mt-1 text-xs text-muted-foreground">
          Recording Consent:{" "}
          <span className={appointment.recording_consent ? "text-green-600" : "text-red-600"}>
            {appointment.recording_consent ? "Given" : "Not Given"}
          </span>
        </div>
      )}
      {appointment.recording_url && (
        <div className="mt-1">
          <a
            className="text-xs underline text-blue-600 hover:text-blue-800"
            href={appointment.recording_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Recording
          </a>
        </div>
      )}
      {appointment.sync_status && (
        <AppointmentSyncStatus 
          syncStatus={appointment.sync_status}
          syncError={appointment.sync_error}
          lastSyncAttempt={appointment.last_sync_attempt}
          showRetry={appointment.sync_status === 'failed'}
          onRetry={() => onSync(appointment.id)}
        />
      )}
      {hasConflicts && <AppointmentConflicts conflicts={appointment.conflicts as any[]} />}
      {appointment.recurrence_rule && (
        <div className="text-sm text-muted-foreground">
          <p>
            Repeats: {appointment.recurrence_rule.replace('FREQ=', '')}
            {appointment.recurrence_end_date && 
              ` until ${format(new Date(appointment.recurrence_end_date), 'MMM d, yyyy')}`
            }
          </p>
          {appointment.parent_appointment_id && (
            <p className="text-xs">Part of a recurring series</p>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        {appointment.status === "scheduled" && isTherapist && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => onConfirm(appointment.id)}
          >
            Confirm
          </Button>
        )}
        {isTherapist && isGoogleCalendarConnected && needsSync && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onSync(appointment.id)}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${appointment.sync_status === 'pending' ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        )}
        {appointment.video_enabled && (
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-xs"
            onClick={() => onJoinVideo(appointment.id)}
          >
            <Video className="h-3.5 w-3.5 mr-1" />
            Join
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentListItem;
